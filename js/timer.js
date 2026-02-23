import { D, save, autoRecord } from './store.js';
import { playRing, playTick, resumeAudio } from './audio.js';
import { liveDate } from './utils.js';
import { renderTimerTaskList, renderToday, updateStats } from './render.js';
import { renderChart } from './chart.js';

/* ═══════════════════════════════════════ */
/* TIMER CONSTANTS & STATE                */
/* ═══════════════════════════════════════ */
const WT=25*60, SB=5*60, LB=20*60, CIRC=2*Math.PI*90;
let tState='idle', tMode='work', timeLeft=WT, totalTime=WT, tInterval=null;
let wallStart=0, wallTimeLeft=0; // wall-clock tracking for accuracy

/* DOM references (safe — ES modules are deferred) */
const tProg=document.getElementById('timer-progress');
const tTimeEl=document.getElementById('timer-time');
const tModeLabel=document.getElementById('timer-mode-label');
const btnStart=document.getElementById('btn-start');
const btnVoid=document.getElementById('btn-void');
const btnSkip=document.getElementById('btn-skip');
const intRow=document.getElementById('interrupt-row');
const vBanner=document.getElementById('void-banner');

tProg.style.strokeDasharray=CIRC;

/* ═══════════════════════════════════════ */
/* DISPLAY                                */
/* ═══════════════════════════════════════ */
export function updateTimerDisplay(){
  const m=Math.floor(timeLeft/60), s=timeLeft%60;
  const ts=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  tTimeEl.textContent=ts;
  tProg.style.strokeDashoffset=CIRC*(timeLeft/totalTime);
  tProg.classList.toggle('break-mode',tMode==='break');
  document.title=tState==='running'?`${ts} — Pomodoro`:'Pomodoro Planner';
}

/* ═══════════════════════════════════════ */
/* CORE TIMER CONTROLS                    */
/* ═══════════════════════════════════════ */
export function startTimer(){
  vBanner.style.display='none';
  if(tMode==='work'&&!D.selectedTaskId){alert('Select a task.');return;}
  resumeAudio();
  if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();
  wallStart=Date.now();wallTimeLeft=timeLeft;
  tState='running';updateControlsUI();tInterval=setInterval(tick,250);
}

export function pauseTimer(){
  const elapsed=Math.floor((Date.now()-wallStart)/1000);
  timeLeft=Math.max(0,wallTimeLeft-elapsed);
  tState='paused';clearInterval(tInterval);updateTimerDisplay();updateControlsUI();
}

export function tick(){
  const elapsed=Math.floor((Date.now()-wallStart)/1000);
  const prev=timeLeft;
  timeLeft=Math.max(0,wallTimeLeft-elapsed);
  if(timeLeft<=0){clearInterval(tInterval);timerComplete();return;}
  if(timeLeft!==prev)updateTimerDisplay();
}

/* ═══════════════════════════════════════ */
/* AUTO-FILL NEXT SHAPE                   */
/* ═══════════════════════════════════════ */
export function autoFillNext(t){
  if((t.actual1||0)<(t.estimate||0)){t.actual1=(t.actual1||0)+1;return;}
  if((t.actual2||0)<(t.est2||0)){t.actual2=(t.actual2||0)+1;return;}
  if((t.actual3||0)<(t.est3||0)){t.actual3=(t.actual3||0)+1;return;}
  t.estimate=(t.estimate||0)+1;t.actual1=(t.actual1||0)+1;
}

/* ═══════════════════════════════════════ */
/* NOTIFICATIONS                          */
/* ═══════════════════════════════════════ */
export function notifyUser(msg){
  try{
    if('Notification' in window&&Notification.permission==='granted')
      new Notification('Pomodoro',{body:msg,icon:'/icons/icon-192x192.png'});
  }catch(e){}
}

/* ═══════════════════════════════════════ */
/* TIMER COMPLETE                         */
/* ═══════════════════════════════════════ */
export function timerComplete(){
  playRing();
  if(tMode==='work'){
    const now=liveDate();
    // Midnight crossing check
    if(now!==D.todayDate){autoRecord();D.todayDate=now;D.todayPomos=0;D.setCount=0;}
    const t=D.today.find(x=>x.id===D.selectedTaskId);
    if(t){
      autoFillNext(t);
      if(!t.dailyPomos)t.dailyPomos={};
      t.dailyPomos[now]=(t.dailyPomos[now]||0)+1;
    }
    D.todayPomos++;D.totalPomos++;D.setCount++;
    autoRecord();save();
    if(navigator.vibrate)navigator.vibrate([200,100,200]);
    notifyUser('Pomodoro complete! Time for a break.');
    if(D.setCount>=4){
      tMode='break';timeLeft=LB;totalTime=LB;tModeLabel.textContent='LONG BREAK';D.setCount=0;
    }else{
      tMode='break';timeLeft=SB;totalTime=SB;tModeLabel.textContent='SHORT BREAK';
    }
  }else{
    notifyUser('Break over! Ready to focus.');
    tMode='work';timeLeft=WT;totalTime=WT;tModeLabel.textContent='FOCUS';
  }
  tState='idle';save();
  updateTimerDisplay();updateControlsUI();renderTimerTaskList();renderToday();updateSetCounter();updateStats();renderChart();
}

/* ═══════════════════════════════════════ */
/* VOID / SKIP / INTERRUPT                */
/* ═══════════════════════════════════════ */
export function voidPomodoro(){
  if(tMode!=='work')return;
  if(!confirm('Void this Pomodoro?'))return;
  clearInterval(tInterval);
  tState='idle';tMode='work';timeLeft=WT;totalTime=WT;tModeLabel.textContent='FOCUS';
  vBanner.style.display='block';
  updateTimerDisplay();updateControlsUI();
}

export function skipBreak(){
  clearInterval(tInterval);
  tState='idle';tMode='work';timeLeft=WT;totalTime=WT;tModeLabel.textContent='FOCUS';
  updateTimerDisplay();updateControlsUI();
}

export function markInterrupt(type){
  const t=D.today.find(x=>x.id===D.selectedTaskId);if(!t)return;
  if(type==='internal')t.internalInt++;else t.externalInt++;
  save();renderTimerTaskList();renderToday();playTick();
}

/* ═══════════════════════════════════════ */
/* UI CONTROLS                            */
/* ═══════════════════════════════════════ */
export function updateControlsUI(){
  const isR=tState==='running', isP=tState==='paused', isI=tState==='idle', isW=tMode==='work', isB=tMode==='break';
  if(isR){
    btnStart.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    btnStart.className='timer-btn-main pause';
  }else{
    btnStart.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>';
    btnStart.className='timer-btn-main start';
  }
  btnVoid.style.display=(isR||isP)&&isW?'flex':'none';
  btnSkip.style.display=(isI||isP)&&isB?'flex':'none';
  intRow.style.display=(isR||isP)&&isW?'flex':'none';
  document.getElementById('timer-rule').style.display=isI&&isW?'block':'none';
}

export function updateSetCounter(){
  document.querySelectorAll('.pomo-counter-dot').forEach((d,i)=>{
    d.classList.remove('filled','current');
    if(i<D.setCount)d.classList.add('filled');
    if(i===D.setCount)d.classList.add('current');
  });
}

/* ═══════════════════════════════════════ */
/* EVENT LISTENERS                        */
/* ═══════════════════════════════════════ */
export function initTimerListeners(){
  btnStart.addEventListener('click',()=>{if(tState==='running')pauseTimer();else startTimer();});
  btnVoid.addEventListener('click',voidPomodoro);
  btnSkip.addEventListener('click',skipBreak);
  document.getElementById('btn-int-int').addEventListener('click',()=>markInterrupt('internal'));
  document.getElementById('btn-int-ext').addEventListener('click',()=>markInterrupt('external'));
}
