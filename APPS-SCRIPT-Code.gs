/**
 * CleanCrew Empire - Google Apps Script backend + Stripe digital delivery
 *
 * Script Properties required for automatic delivery:
 * STRIPE_SECRET_KEY                  sk_live_... (or sk_test_... while testing)
 * STRIPE_WEBHOOK_KEY                 long random string you choose
 * STARTER_DRIVE_FILE_ID              Google Drive file id for $29 package
 * PRO_DRIVE_FILE_ID                  Google Drive file id for $79 package
 * ELITE_DRIVE_FILE_ID                Google Drive file id for $149 package
 * BUSINESS_DRIVE_FILE_ID             Google Drive file id for $299 package
 * SPONSOR_DRIVE_FILE_ID              Google Drive file id for $499 package
 * RESELLER_DRIVE_FILE_ID             Google Drive file id for $997 package
 * SELLER_BCC_EMAIL                   optional
 * DELIVERY_FROM_NAME                 optional, defaults to CleanCrew Empire
 *
 * Optional Stripe Price IDs (recommended if you use discounts or change prices):
 * STARTER_PRICE_ID, PRO_PRICE_ID, ELITE_PRICE_ID, BUSINESS_PRICE_ID,
 * SPONSOR_PRICE_ID, RESELLER_PRICE_ID
 *
 * Stripe webhook URL:
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?webhook_key=YOUR_STRIPE_WEBHOOK_KEY
 * Listen for: checkout.session.completed and checkout.session.async_payment_succeeded
 */

const SHEET_TABS=['USERS','ROLES','OWNERS','ADMINS','STAFF','CLIENTS','AFFILIATES','SERVICES','SERVICE_PACKAGES','BOOKINGS','JOBS','HOMES','HOME_CLEANS','CLEANING_SCHEDULE','MONTHLY_SCHEDULE','ASSIGNMENTS','CLOCK_INS','CLOCK_OUTS','TIMESHEETS','STAFF_PAY','PAY_RATES','CHECKLISTS','HOME_NOTES','CLIENT_NOTES','REVIEWS','GALLERY','QUOTES','COMMERCIAL_QUOTES','APPLICANTS','SUPPLIES','INVENTORY','EXPENSES','PROFIT','PAYMENTS','PAID_STATUS','DELEGATIONS','PERMISSIONS','SCHEDULE_PERMISSIONS','ROLE_ACCESS','AFFILIATE_CODES','AFFILIATE_DISCOUNTS','AFFILIATE_INCOME','CLICKS','SALES','CONTACT_MESSAGES','NOTIFICATIONS','SETTINGS','FEATURE_RECORDS','REPORTS','ENGINE_EVENTS','STRIPE_EVENTS','DELIVERY_LOG','PAYMENT_FAILURES'];

const PACKAGE_MAP = {
  starter:  {name:'Starter', price:2900,   driveProperty:'STARTER_DRIVE_FILE_ID',  priceProperty:'STARTER_PRICE_ID'},
  pro:      {name:'Cleaner Pro', price:7900, driveProperty:'PRO_DRIVE_FILE_ID',      priceProperty:'PRO_PRICE_ID'},
  elite:    {name:'Cleaning Elite', price:14900, driveProperty:'ELITE_DRIVE_FILE_ID', priceProperty:'ELITE_PRICE_ID'},
  business: {name:'Business', price:29900, driveProperty:'BUSINESS_DRIVE_FILE_ID', priceProperty:'BUSINESS_PRICE_ID'},
  sponsor:  {name:'Sponsor', price:49900, driveProperty:'SPONSOR_DRIVE_FILE_ID',   priceProperty:'SPONSOR_PRICE_ID'},
  reseller: {name:'Reseller / White-Label', price:99700, driveProperty:'RESELLER_DRIVE_FILE_ID', priceProperty:'RESELLER_PRICE_ID'}
};

function doPost(e){
  try{
    const raw=(e&&e.postData&&e.postData.contents)||'{}';
    const body=JSON.parse(raw);
    ensureSheets_();

    // Stripe webhook events are recognized by their event type + data.object shape.
    if(body && body.type && body.data && body.data.object){
      return handleStripeWebhook_(e, body);
    }

    // Existing CleanCrew app API remains intact.
    const action=body.action||'record_create';
    const payload=body.payload||{};
    return json_(append_(routeTab_(action),{action:action,payload:payload,receivedAt:new Date().toISOString()}));
  }catch(err){
    return json_({ok:false,error:String(err)});
  }
}

function doGet(e){
  ensureSheets_();
  const p=(e&&e.parameter)||{};
  if(p.action==='deliver_session' && p.session_id){
    try{
      const result=deliverPaidSession_(String(p.session_id), 'success-page-backup');
      return json_(result);
    }catch(err){
      return json_({ok:false,error:String(err)});
    }
  }
  if(p.action==='delivery_status' && p.session_id){
    return json_(deliveryStatus_(String(p.session_id)));
  }
  return json_({ok:true,app:'CleanCrew Empire Production Backend',tabs:SHEET_TABS,delivery:'enabled'});
}

function handleStripeWebhook_(e,event){
  const props=PropertiesService.getScriptProperties();
  const expected=props.getProperty('STRIPE_WEBHOOK_KEY')||'';
  const provided=(e&&e.parameter&&e.parameter.webhook_key)||'';
  if(!expected || provided!==expected){
    return json_({ok:false,error:'Webhook authentication failed.'});
  }

  const eventId=String(event.id||'');
  if(eventId && hasEvent_(eventId)) return json_({ok:true,duplicate:true});
  logStripeEvent_(event);

  const failed=['checkout.session.async_payment_failed','checkout.session.expired'];
  if(failed.indexOf(event.type)!==-1){
    const failedSession=event.data && event.data.object || {};
    recordPaymentFailure_(event.type, failedSession);
    return json_({ok:true,recordedFailure:true,type:event.type});
  }

  const accepted=['checkout.session.completed','checkout.session.async_payment_succeeded'];
  if(accepted.indexOf(event.type)===-1) return json_({ok:true,ignored:true,type:event.type});

  const sessionId=event.data && event.data.object && event.data.object.id;
  if(!sessionId) return json_({ok:false,error:'Missing Checkout Session id.'});

  const result=deliverPaidSession_(sessionId,'stripe-webhook');
  return json_(result);
}

function deliverPaidSession_(sessionId,source){
  if(alreadyDelivered_(sessionId)) return {ok:true,alreadyDelivered:true,sessionId:sessionId};

  // Never trust client/webhook purchase details alone. Retrieve the Checkout Session from Stripe.
  const session=stripeGetSession_(sessionId);
  if(!session || session.id!==sessionId) throw new Error('Stripe session could not be verified.');
  if(session.payment_status!=='paid') return {ok:false,pending:true,paymentStatus:session.payment_status||'unknown'};

  const email=(session.customer_details&&session.customer_details.email)||session.customer_email||'';
  if(!email) throw new Error('Stripe checkout did not provide a buyer email address.');

  const packageKey=identifyPackage_(session);
  if(!packageKey) throw new Error('Paid Stripe session did not match one of the six configured CleanCrew packages.');

  const info=PACKAGE_MAP[packageKey];
  const props=PropertiesService.getScriptProperties();
  const fileId=props.getProperty(info.driveProperty)||'';
  if(!fileId) throw new Error('Missing Script Property '+info.driveProperty+'. Upload the package ZIP to Drive and add its file ID.');

  const file=DriveApp.getFileById(fileId);
  const blob=file.getBlob().setName(file.getName());
  const fromName=props.getProperty('DELIVERY_FROM_NAME')||'CleanCrew Empire';
  const bcc=props.getProperty('SELLER_BCC_EMAIL')||'';
  const subject='Your CleanCrew Empire '+info.name+' Package Is Ready';
  const plain=[
    'Thank you for your purchase!',
    '',
    'Your CleanCrew Empire '+info.name+' package is attached to this email.',
    '',
    'Order: '+sessionId,
    'Package: '+info.name,
    '',
    'Save this email and your original package file in a safe place.',
    'For setup help, use the instructions included inside your package.',
    '',
    'CleanCrew Empire'
  ].join('\n');

  const html='<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171717">'+
    '<div style="background:#111;color:#fff;padding:22px;border-radius:16px 16px 0 0">'+
    '<div style="font-size:25px;font-weight:800">CleanCrew <span style="color:#ff3f86">Empire</span></div></div>'+
    '<div style="padding:28px;border:1px solid #f0d9df;border-top:0;border-radius:0 0 16px 16px">'+
    '<h2 style="margin-top:0">Your '+escapeHtml_(info.name)+' package is ready!</h2>'+
    '<p>Thank you for your purchase. Your complete buyer package is attached to this email.</p>'+
    '<div style="background:#fff6f9;border:1px solid #ffd3e2;padding:16px;border-radius:12px;margin:20px 0">'+
    '<b>Package:</b> '+escapeHtml_(info.name)+'<br><b>Order:</b> '+escapeHtml_(sessionId)+'</div>'+
    '<p><b>Next:</b> Download the ZIP, keep an original backup copy, then follow the included setup instructions.</p>'+
    '<p style="font-size:12px;color:#777">This delivery was generated automatically after Stripe confirmed successful payment.</p>'+
    '</div></div>';

  const options={name:fromName,htmlBody:html,attachments:[blob]};
  if(bcc) options.bcc=bcc;
  GmailApp.sendEmail(email,subject,plain,options);

  recordDelivery_(sessionId,email,packageKey,file.getName(),source,session.amount_total,session.currency);
  append_('SALES',{action:'stripe_sale',payload:{sessionId:sessionId,email:email,package:packageKey,packageName:info.name,amount:session.amount_total,currency:session.currency},receivedAt:new Date().toISOString()});
  return {ok:true,delivered:true,sessionId:sessionId,package:packageKey,emailMasked:maskEmail_(email)};
}

function recordPaymentFailure_(eventType,session){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PAYMENT_FAILURES');
  sh.appendRow([String(session.id||Utilities.getUuid()),new Date().toISOString(),String(eventType||''),(session.customer_details&&session.customer_details.email)||session.customer_email||'',session.amount_total||'',session.currency||'']);
}

function configurationStatus(){
  const p=PropertiesService.getScriptProperties();
  const required=['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_KEY','STARTER_DRIVE_FILE_ID','PRO_DRIVE_FILE_ID','ELITE_DRIVE_FILE_ID','BUSINESS_DRIVE_FILE_ID','SPONSOR_DRIVE_FILE_ID','RESELLER_DRIVE_FILE_ID'];
  const missing=required.filter(function(k){return !p.getProperty(k);});
  return {ok:missing.length===0,missing:missing};
}

function stripeGetSession_(sessionId){
  const secret=PropertiesService.getScriptProperties().getProperty('STRIPE_SECRET_KEY')||'';
  if(!secret) throw new Error('STRIPE_SECRET_KEY is not configured in Apps Script Properties.');
  const url='https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId)+'?expand%5B%5D=line_items.data.price';
  const resp=UrlFetchApp.fetch(url,{method:'get',headers:{Authorization:'Bearer '+secret},muteHttpExceptions:true});
  const code=resp.getResponseCode();
  const text=resp.getContentText();
  if(code<200||code>=300) throw new Error('Stripe verification failed ('+code+'): '+text);
  return JSON.parse(text);
}

function identifyPackage_(session){
  const props=PropertiesService.getScriptProperties();
  const items=(session.line_items&&session.line_items.data)||[];
  const priceIds=[];
  items.forEach(function(item){ if(item.price&&item.price.id) priceIds.push(String(item.price.id)); });

  const keys=Object.keys(PACKAGE_MAP);
  for(let i=0;i<keys.length;i++){
    const k=keys[i], configured=props.getProperty(PACKAGE_MAP[k].priceProperty)||'';
    if(configured && priceIds.indexOf(configured)!==-1) return k;
  }

  // Safe fallback for the site's six unique fixed one-time prices.
  const subtotal=Number(session.amount_subtotal||session.amount_total||0);
  for(let i=0;i<keys.length;i++) if(PACKAGE_MAP[keys[i]].price===subtotal) return keys[i];
  return '';
}

function alreadyDelivered_(sessionId){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DELIVERY_LOG');
  if(!sh || sh.getLastRow()<2) return false;
  const finder=sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(sessionId).matchEntireCell(true).findNext();
  return !!finder;
}

function deliveryStatus_(sessionId){
  return {ok:true,sessionId:sessionId,delivered:alreadyDelivered_(sessionId)};
}

function recordDelivery_(sessionId,email,packageKey,fileName,source,amount,currency){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DELIVERY_LOG');
  sh.appendRow([sessionId,new Date().toISOString(),email,packageKey,fileName,source,amount||'',currency||'']);
}

function logStripeEvent_(event){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('STRIPE_EVENTS');
  sh.appendRow([String(event.id||Utilities.getUuid()),new Date().toISOString(),String(event.type||''),JSON.stringify(event)]);
}

function hasEvent_(eventId){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('STRIPE_EVENTS');
  if(!sh || sh.getLastRow()<2) return false;
  return !!sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(eventId).matchEntireCell(true).findNext();
}

function routeTab_(a){a=String(a||'').toLowerCase();if(a.includes('clock_in'))return'CLOCK_INS';if(a.includes('clock_out'))return'CLOCK_OUTS';if(a.includes('comment')||a.includes('note'))return'HOME_NOTES';if(a.includes('checklist'))return'CHECKLISTS';if(a.includes('assignment'))return'ASSIGNMENTS';if(a.includes('booking'))return'BOOKINGS';if(a.includes('review'))return'REVIEWS';if(a.includes('affiliate'))return'AFFILIATE_CODES';if(a.includes('delegation'))return'DELEGATIONS';if(a.includes('pay'))return'STAFF_PAY';if(a.includes('expense'))return'EXPENSES';if(a.includes('profit'))return'PROFIT';if(a.includes('quote'))return a.includes('commercial')?'COMMERCIAL_QUOTES':'QUOTES';if(a.includes('gallery'))return'GALLERY';if(a.includes('service'))return'SERVICE_PACKAGES';if(a.includes('supply'))return'SUPPLIES';if(a.includes('applicant')||a.includes('hiring'))return'APPLICANTS';if(a.includes('home')||a.includes('clean'))return'HOME_CLEANS';if(a.includes('client'))return'CLIENTS';if(a.includes('staff'))return'STAFF';if(a.includes('admin'))return'ADMINS';if(a.includes('contact'))return'CONTACT_MESSAGES';if(a.includes('sale'))return'SALES';if(a.includes('click'))return'CLICKS';if(a.includes('setting'))return'SETTINGS';if(a.includes('engine'))return'ENGINE_EVENTS';if(a==='register')return'USERS';return'FEATURE_RECORDS'}

function ensureSheets_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  SHEET_TABS.forEach(function(n){
    let sh=ss.getSheetByName(n);
    if(!sh){
      sh=ss.insertSheet(n);
      if(n==='DELIVERY_LOG') sh.appendRow(['sessionId','deliveredAt','email','package','fileName','source','amount','currency']);
      else if(n==='STRIPE_EVENTS') sh.appendRow(['eventId','receivedAt','type','json']);
      else if(n==='PAYMENT_FAILURES') sh.appendRow(['sessionId','recordedAt','eventType','email','amount','currency']);
      else sh.appendRow(['id','createdAt','json']);
    }
  });
}

function append_(tab,obj){const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tab);const id=Utilities.getUuid();sh.appendRow([id,new Date().toISOString(),JSON.stringify(obj)]);return{ok:true,tab:tab,id:id}}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function escapeHtml_(s){return String(s||'').replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function maskEmail_(email){const p=String(email||'').split('@');if(p.length!==2)return'';return(p[0].slice(0,2)||'*')+'***@'+p[1]}
