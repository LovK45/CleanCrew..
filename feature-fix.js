
(function(){
const KEY="cleancrew_feature_records_v2";
function get(){return JSON.parse(localStorage.getItem(KEY)||"{}")}
function set(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function money(n){return "$"+Number(n||0).toLocaleString()}
function renderLists(){
  document.querySelectorAll("[data-feature-list]").forEach(el=>{
    const key=el.dataset.featureList, s=get(), rows=s[key]||[];
    el.innerHTML = rows.length ? rows.map(r=>`<div class="clean-card"><h3>${r.packageName||r.clientName||r.name||r.label||r.service||r.jobAddress||"Saved Record"}</h3><p>${r.address||r.notes||r.review||r.status||r.category||""}</p><span class="pill-status">${r.cleanType||r.service||r.date||r.rating||"Saved"}</span></div>`).join("") : "<p>No records saved yet.</p>";
  });
}
document.addEventListener("submit", e=>{
  if(e.target.classList.contains("featureForm")){
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.target));
    const key=e.target.dataset.output;
    const s=get(); s[key]=s[key]||[]; s[key].push({...data,id:Date.now()}); set(s);
    const out=document.querySelector("#featureOutput");
    if(out) out.textContent = `${e.target.dataset.feature} saved.\n\n${e.target.dataset.demo}\n\nRecord:\n` + JSON.stringify(data,null,2);
    if(typeof api==="function") api("feature_"+key+"_save",data).catch(()=>{});
    e.target.reset(); renderLists();
  }
  if(e.target.id==="quoteCalcForm"){
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.target));
    const base={"Standard Clean":120,"Deep Clean":220,"Move-In/Move-Out":300,"Airbnb Turnover":165}[d.service]||120;
    let total=base+(+d.bedrooms*18)+(+d.bathrooms*22)+(+d.addons*35)+(+d.travel||0);
    const discount=Math.round(total*((+d.discount||0)/100)); total-=discount;
    const staffPay=Math.round(total*.42), profit=total-staffPay;
    document.querySelector("#featureOutput").textContent=`Client Quote: ${money(total)}\nAffiliate Discount: ${money(discount)}\nEstimated Cleaner Pay: ${money(staffPay)}\nEstimated Gross Profit: ${money(profit)}\n\nThis quote can be copied into a booking or saved to Google Sheets in live mode.`;
  }
  if(e.target.id==="profitCalcForm"){
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.target));
    const net=(+d.revenue||0)-(+d.staffPay||0)-(+d.expenses||0);
    document.querySelector("#featureOutput").textContent=`Revenue: ${money(d.revenue)}\nCleaner Pay: ${money(d.staffPay)}\nExpenses: ${money(d.expenses)}\nUnpaid Balances: ${money(d.unpaid)}\nEstimated Net Profit: ${money(net)}\nCash Collected After Unpaid: ${money(net-(+d.unpaid||0))}`;
  }
  if(e.target.id==="commercialCalcForm"){
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.target));
    const labor=(+d.sqft/1000)*(+d.visits)*55+(+d.bathrooms*12)*(+d.visits)+(+d.staff*80);
    const total=Math.round(labor*(1+(+d.margin||0)/100));
    document.querySelector("#featureOutput").textContent=`Commercial Monthly Quote: ${money(total)}\nEstimated Labor/Supply Base: ${money(Math.round(labor))}\nDesired Margin: ${d.margin}%\nRecommended Deposit: ${money(Math.round(total*.25))}\n\nUse this for office, church, salon, retail, and recurring commercial cleaning quotes.`;
  }
});
document.addEventListener("DOMContentLoaded", renderLists);
renderLists();
})();
