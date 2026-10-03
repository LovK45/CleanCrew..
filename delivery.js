(function(){
  function $(sel){return document.querySelector(sel)}
  function render(msg,good){
    var box=$('#delivery-status'); if(!box)return;
    box.textContent=msg; box.style.color=good?'#137a45':'#7b5b52';
  }
  var params=new URLSearchParams(location.search);
  var sessionId=params.get('session_id');
  if(!sessionId){render('Payment complete. Check the email address used at checkout for your package.',true);return;}
  if(!window.CONFIG || !CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.indexOf('REPLACE_')===0){
    render('Payment complete. Automatic email delivery will activate after the Apps Script URL is connected.',false);return;
  }
  render('Confirming payment and preparing your email delivery…',false);
  var url=CONFIG.APPS_SCRIPT_URL+'?action=deliver_session&session_id='+encodeURIComponent(sessionId);
  fetch(url,{method:'GET',mode:'cors'})
    .then(function(r){return r.json()})
    .then(function(x){
      if(x.delivered||x.alreadyDelivered) render('Success! Your package has been emailed to the address used at checkout.',true);
      else if(x.pending) render('Your payment is still processing. Your package will be emailed automatically as soon as Stripe confirms it.',false);
      else render('Payment received. If your email does not arrive shortly, contact support with order '+sessionId+'.',false);
    })
    .catch(function(){render('Payment received. Your Stripe webhook will continue the automatic email delivery in the background.',false)});
})();
