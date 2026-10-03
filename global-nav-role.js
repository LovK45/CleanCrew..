(function(){
const ROLE="cleancrew_active_role", DEL="cleancrew_schedule_delegates", routes={owner:"owner-dashboard.html",admin:"admin-dashboard.html",staff:"staff-dashboard.html",client:"client-dashboard.html",affiliate:"affiliate-dashboard.html"};
function role(){return localStorage.getItem(ROLE)||localStorage.getItem("cleancrew_role")||""}
function setRole(r){localStorage.setItem(ROLE,r);localStorage.setItem("cleancrew_role",r)}
function dels(){return JSON.parse(localStorage.getItem(DEL)||"[]")}
function canSchedule(r){return r==="owner"||dels().includes(r)}
function inject(){
  if(document.querySelector(".global-nav"))return;
  document.body.insertAdjacentHTML("afterbegin",`<div class="global-nav" role="navigation" aria-label="Primary navigation">
    <a class="global-brand" href="index.html" aria-label="CleanCrew Empire home"><span class="global-logo" aria-hidden="true">♛</span><span class="brand-words"><b>CleanCrew</b><em>Empire</em></span></a>
    <div class="global-links">
      <a href="index.html" class="home-link">Home</a>
      <a href="features.html">Features</a>
      <a href="services.html">Services</a>
      <a href="role-login.html" data-open-dashboard>Dashboard</a>
      <a href="booking-requests.html">Bookings</a>
      <a href="monthly-schedule.html" data-schedule-link>Schedule</a>
      <a href="marketplace.html">Marketplace</a>
      <a href="pricing.html">Pricing</a>
      <a href="brand-studio.html">Brand Studio</a>
    </div>
    <div class="global-actions"><a class="global-btn ghost" href="role-login.html">Demo Login</a><button class="global-btn" data-open-demo-modal>Preview</button></div>
  </div>`);
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.global-links a').forEach(a=>{if((a.getAttribute('href')||'').toLowerCase()===current)a.classList.add('active')});
}
function modal(){if(document.querySelector(".role-demo-dock"))return;document.body.insertAdjacentHTML("beforeend",`<div class="role-demo-dock"><div class="role-demo-modal"><button class="global-btn ghost" data-close-demo-modal>Close</button><h2>Choose a demo user type</h2><p>Select what dashboard access you want to preview.</p><div class="role-demo-grid">${Object.keys(routes).map(r=>`<button class="role-demo-card" data-demo-role="${r}"><b>${r.toUpperCase()} Demo</b>Open ${r} dashboard access.</button>`).join("")}</div></div></div>`)}
function footer(){if(document.querySelector(".site-contact-footer"))return;let b={};try{b=JSON.parse(localStorage.getItem("cleancrew_brand_profile_v1")||"{}")||{}}catch(e){};const email=b.email||CONFIG.CONTACT_EMAIL;const name=b.businessName||"CleanCrew Empire";document.body.insertAdjacentHTML("beforeend",`<section class="site-contact-footer"><div class="contact-card"><div><p class="eyebrow">Questions before buying?</p><h2>Contact ${name}</h2><p>Ask about setup, licensing, features, or customization.</p><p class="legal-links"><a href="terms.html">Terms</a> · <a href="privacy.html">Privacy</a> · <a href="refund-policy.html">Refund Policy</a> · <a href="license.html">Licensing</a></p></div><a class="global-btn" href="mailto:${email}?subject=Question%20About%20${encodeURIComponent(name)}">Email ${email}</a></div></section>`) }
function protect(){if(!location.pathname.endsWith("monthly-schedule.html"))return;let r=role();if(canSchedule(r))return;let main=document.querySelector("main")||document.body;main.innerHTML=`<section class="workflow-panel center"><p class="eyebrow">Schedule access restricted</p><h1>Monthly schedule is owner-only.</h1><p>Owner can delegate schedule access to admin or staff. Current role: ${r||"none"}.</p><button class="global-btn" data-open-demo-modal>Switch Demo Role</button></section>`}
document.addEventListener("click",e=>{
  if(e.target.closest("[data-open-demo-modal]")){e.preventDefault();document.querySelector(".role-demo-dock").classList.add("open")}
  if(e.target.closest("[data-close-demo-modal]")){e.preventDefault();document.querySelector(".role-demo-dock").classList.remove("open")}
  let d=e.target.closest("[data-demo-role]");if(d){setRole(d.dataset.demoRole);location.href=routes[d.dataset.demoRole]}
  if(e.target.closest("[data-open-dashboard]")){e.preventDefault();let r=role();if(!r){document.querySelector(".role-demo-dock").classList.add("open");return}location.href=routes[r]||"owner-dashboard.html"}
  if(e.target.closest("[data-schedule-link]")&&!canSchedule(role())){e.preventDefault();location.href="monthly-schedule.html"}
});
document.addEventListener("DOMContentLoaded",()=>{inject();modal();footer();protect()})
})();
