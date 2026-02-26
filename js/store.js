import { liveDate } from './utils.js';

export const SK_BASE='pomo_v6';
export function getSK(){const u=typeof netlifyIdentity!=='undefined'&&netlifyIdentity.currentUser();return u?SK_BASE+'_'+u.id:SK_BASE;}
export function load(){try{const r=localStorage.getItem(getSK());if(r)return JSON.parse(r);}catch(e){}return fresh();}
export function fresh(){return{inventory:[],today:[],unplanned:[],records:[],completed:[],trash:[],selectedTaskId:null,todayDate:new Date().toISOString().split('T')[0],todayPomos:0,setCount:0,totalPomos:0};}
export function save(){D.lastModified=Date.now();try{localStorage.setItem(getSK(),JSON.stringify(D));}catch(e){}debouncedCloudSave();}

export function mig(t){if(t.actual1===undefined){t.actual1=t.actual||0;t.actual2=0;t.actual3=0;}if(t.est2===undefined)t.est2=0;if(t.est3===undefined)t.est3=0;if(t.review===undefined)t.review='';if(t.estimate===undefined)t.estimate=0;if(!t.dailyPomos)t.dailyPomos={};if(t.subtasks===undefined)t.subtasks=[];if(t.priority===undefined)t.priority=null;delete t.actual;return t;}

export function ensureFields(){
  if(!D.inventory)D.inventory=[];
  if(!D.today)D.today=[];
  if(!D.unplanned)D.unplanned=[];
  if(!D.records)D.records=[];
  if(!D.completed)D.completed=[];
  if(!D.trash)D.trash=[];
  if(D.todayPomos===undefined)D.todayPomos=0;
  if(D.setCount===undefined)D.setCount=0;
  if(D.totalPomos===undefined)D.totalPomos=0;
  if(!D.todayDate)D.todayDate=TODAY;
  D.inventory.forEach(t=>{if(t.review===undefined)t.review='';});
  D.today.forEach(mig);
  D.completed.forEach(t=>{if(t.review===undefined)t.review='';});
}

export let D=load();
export function replaceD(newD){D=newD;}

export let pickerSelectedIds=new Set();
export function setPickerSelectedIds(val){pickerSelectedIds=val;}
export function clearPickerSelectedIds(){pickerSelectedIds.clear();}
export function togglePickerSelectedId(id){if(pickerSelectedIds.has(id))pickerSelectedIds.delete(id);else pickerSelectedIds.add(id);}

export const TODAY=new Date().toISOString().split('T')[0];

/* ── Data initialization / migration ── */
ensureFields();
if(D.todayDate!==TODAY){D.todayDate=TODAY;D.todayPomos=0;D.setCount=0;save();}

/* ── Cloud sync ── */
let _cloudTimer;
export function debouncedCloudSave(){clearTimeout(_cloudTimer);_cloudTimer=setTimeout(cloudSave,2000);}
export function showSyncToast(msg,ok){
  const t=document.getElementById('sync-toast');t.textContent=msg;
  t.className='sync-toast '+(ok?'ok':'fail')+' show';
  clearTimeout(t._tid);t._tid=setTimeout(()=>t.classList.remove('show'),2500);
}
export async function cloudSave(){
  const u=typeof netlifyIdentity!=='undefined'&&netlifyIdentity.currentUser();if(!u)return false;
  try{await u.update({data:{pomodoro:D}});return true;}catch(e){console.warn('Cloud save failed:',e);return false;}
}
export async function cloudLoad(){
  const u=typeof netlifyIdentity!=='undefined'&&netlifyIdentity.currentUser();if(!u)return null;
  try{
    const tk=await u.jwt();
    const r=await fetch('/.netlify/identity/user',{headers:{'Authorization':'Bearer '+tk}});
    if(r.ok){const usr=await r.json();return usr.user_metadata?.pomodoro||null;}
  }catch(e){console.warn('Cloud load failed:',e);}return null;
}
export async function switchUserData(migrateAnon){
  const sk=getSK();
  if(migrateAnon&&!localStorage.getItem(sk)){const ad=localStorage.getItem(SK_BASE);if(ad)localStorage.setItem(sk,ad);}
  D=load();
  const cloud=await cloudLoad();
  if(cloud){const ct=cloud.lastModified||0,lt=D.lastModified||0;if(ct>lt){D=cloud;try{localStorage.setItem(getSK(),JSON.stringify(D));}catch(e){}}else if(lt>ct){cloudSave();}}
  else if(migrateAnon){cloudSave();}
  ensureFields();
  if(D.todayDate!==TODAY){D.todayDate=TODAY;D.todayPomos=0;D.setCount=0;save();}
}

/* ── Auto-record ── */
export function autoRecord(){
  const date=liveDate();
  const rec={date,pomos:D.todayPomos,
    tasks:D.today.map(t=>({name:t.name,estimate:t.estimate,est2:t.est2||0,est3:t.est3||0,actual1:t.actual1||0,actual2:t.actual2||0,actual3:t.actual3||0,completed:t.completed,internalInt:t.internalInt,externalInt:t.externalInt,review:t.review||'',dayPomos:(t.dailyPomos&&t.dailyPomos[date])||0,subtasks:t.subtasks?t.subtasks.map(s=>({name:s.name,completed:s.completed})):[]})),
    unplanned:D.unplanned.map(t=>({name:t.name,completed:t.completed}))};
  const idx=D.records.findIndex(r=>r.date===date);
  if(idx>=0)D.records[idx]=rec;else D.records.push(rec);
}
