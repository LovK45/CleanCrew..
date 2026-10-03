window.CleanCrewStore = {
  key:"cleancrew_empire_final_state",
  seed(){return {users:[],records:[],clicks:[],sales:[],settings:{}}},
  get(){return JSON.parse(localStorage.getItem(this.key)||"null")||this.seed()},
  set(s){localStorage.setItem(this.key,JSON.stringify(s));return s},
  push(type,item){const s=this.get();s[type]=s[type]||[];s[type].push({...item,id:Date.now(),createdAt:new Date().toISOString()});return this.set(s)}
};
window.api = async function(action,payload={}){
  if(CONFIG.MODE!=="live" || !String(CONFIG.APPS_SCRIPT_URL).startsWith("https")){
    return {ok:true,mode:"demo",state:CleanCrewStore.push("records",{action,payload})};
  }
  const res=await fetch(CONFIG.APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,payload})});
  return await res.json();
};
