document.addEventListener("submit",async e=>{
  if(e.target.id==="loginForm"||e.target.id==="enhancedLoginForm"){
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.target));
    const role=d.role||"owner";
    localStorage.setItem("cleancrew_active_role",role);
    localStorage.setItem("cleancrew_role",role);
    localStorage.setItem("cleancrew_user",JSON.stringify(d));
    const routes={owner:"owner-dashboard.html",admin:"admin-dashboard.html",staff:"staff-dashboard.html",client:"client-dashboard.html",affiliate:"affiliate-dashboard.html"};
    location.href=routes[role]||"owner-dashboard.html";
  }
  if(e.target.id==="registerForm"){
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.target));
    await api("register",d);
    localStorage.setItem("cleancrew_active_role",d.role||"owner");
    location.href="role-login.html";
  }
});
