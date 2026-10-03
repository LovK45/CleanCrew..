(function(){
const KEY='cleancrew_brand_profile_v1';
const DEFAULTS={businessName:'CleanCrew Empire',tagline:'Book jobs. Run your crew. Grow your empire.',primary:'#f62b72',secondary:'#15a9a0',accent:'#d4a43b',ink:'#17120f',background:'#fffaf6',logo:'',heroImage:'',secondaryImage:'',email:'',phone:'',website:''};
function load(){try{return Object.assign({},DEFAULTS,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return {...DEFAULTS}}}
function save(v){localStorage.setItem(KEY,JSON.stringify(Object.assign({},DEFAULTS,v)));apply(true)}
function reset(){localStorage.removeItem(KEY);location.reload()}
function escapeRx(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function replaceText(root,b){
 const old=['CLEANCREW EMPIRE','CleanCrew Empire™','CleanCrew Empire','CleanCrew'];
 const walker=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/.test(p.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
 let n; while(n=walker.nextNode()){let v=n.nodeValue; old.forEach((o,i)=>{const rep=i===0?b.businessName.toUpperCase():b.businessName;v=v.replace(new RegExp(escapeRx(o),'g'),rep)}); n.nodeValue=v;}
}
function applyLogo(b){
 document.querySelectorAll('.global-brand').forEach(a=>{
   const logo=a.querySelector('.global-logo');
   if(logo && b.logo){logo.innerHTML='<img src="'+b.logo+'" alt="">';logo.classList.add('has-brand-logo')}
   const words=a.querySelector('.brand-words');
   if(words){words.innerHTML='<b>'+b.businessName+'</b><em>Business Platform</em>'}
 });
}
function applyImages(b){
 if(b.heroImage){document.querySelectorAll('.ce-hero-landscape>img,.marketplace-hero>img').forEach(img=>{img.src=b.heroImage;img.alt=b.businessName+' team'})}
 if(b.secondaryImage){document.querySelectorAll('.ce-image-panel>img,.market-license>img').forEach(img=>{img.src=b.secondaryImage;img.alt=b.businessName})}
}
function apply(force){
 const b=load(),s=document.documentElement.style;
 s.setProperty('--ce-pink',b.primary);s.setProperty('--pink',b.primary);s.setProperty('--ce-teal',b.secondary);s.setProperty('--teal',b.secondary);s.setProperty('--ce-gold',b.accent);s.setProperty('--gold',b.accent);s.setProperty('--ce-ink',b.ink);s.setProperty('--ce-cream',b.background);
 document.documentElement.dataset.brandReady='1';
 if(document.body){document.body.dataset.businessName=b.businessName;replaceText(document.body,b);applyLogo(b);applyImages(b);}
 if(document.title) document.title=document.title.replace(/CleanCrew Empire™?|CleanCrew/g,b.businessName);
 return b;
}
function compress(file,kind){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const max=kind==='logo'?700:1800, scale=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL(kind==='logo'?'image/png':'image/jpeg',kind==='logo'?.9:.82))};im.src=r.result};r.readAsDataURL(file)})}
window.CCEBrand={KEY,DEFAULTS,load,save,reset,apply,compress};
let timer;const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>apply(),40)});
document.addEventListener('DOMContentLoaded',()=>{apply();obs.observe(document.body,{childList:true,subtree:true})});
})();