import { D, TODAY, save } from './store.js';
import { esc, fmtDate, totalActual } from './utils.js';
import { renderAllShapes, renderIntMarks, renderReview } from './shapes.js';

function renderPriority(t,src){
  const p=t.priority;
  if(!p)return '';
  return `<div class="priority-dot priority-${p}" data-action="cycle-priority" data-id="${t.id}" data-src="${src}" title="Priority: ${p}"></div>`;
}

function renderSubtasks(t){
  if(!t.subtasks||!t.subtasks.length)return '';
  const completed=t.subtasks.filter(s=>s.completed).length;
  let h=`<div class="subtasks-section"><div class="subtasks-header">${completed}/${t.subtasks.length} subtasks</div>`;
  t.subtasks.forEach(s=>{
    h+=`<div class="subtask-item"><div class="subtask-check ${s.completed?'checked':''}" data-action="toggle-subtask" data-id="${t.id}" data-subid="${s.id}"></div><span class="subtask-name ${s.completed?'completed':''}">${esc(s.name)}</span><button class="subtask-remove" data-action="remove-subtask" data-id="${t.id}" data-subid="${s.id}">×</button></div>`;
  });
  h+=`<div class="subtask-add-row"><input type="text" id="subtask-input-${t.id}" placeholder="Add subtask..."><button class="btn btn-ghost btn-sm" data-action="add-subtask" data-id="${t.id}">+</button></div></div>`;
  return h;
}

export function renderInventory(){
  const c=document.getElementById('inventory-tasks'),e=document.getElementById('inv-empty');
  const tasks=D.inventory.filter(t=>!t.completed);
  if(!tasks.length){c.innerHTML='';e.style.display='block';return;}
  e.style.display='none';
  c.innerHTML=tasks.map(t=>`
    <div class="task-item animate-in">
      <div class="task-content">
        <div class="task-name">${esc(t.name)} ${renderPriority(t,'inv')}</div>
        ${renderReview(t,'inv')}
      </div>
      <div class="task-actions">
        <button class="btn-icon btn-icon-sm" data-action="send-today" data-id="${t.id}" title="Add to today"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <button class="btn-icon btn-icon-sm" data-action="remove-inv" data-id="${t.id}" title="Delete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
    </div>`).join('');
}

export function renderCompleted(){
  const c=document.getElementById('completed-tasks'),e=document.getElementById('completed-empty');
  document.getElementById('completed-count').textContent=D.completed.length;
  if(!D.completed.length){c.innerHTML='';e.style.display='block';return;}
  e.style.display='none';
  c.innerHTML=D.completed.map(t=>`
    <div class="completed-item animate-in">
      <div style="flex:1;">
        <div class="task-name">${esc(t.name)}</div>
      </div>
      <button class="restore-btn" data-action="uncomplete-inv" data-id="${t.id}" title="Move back to inventory">Reopen</button>
      <button class="btn-icon btn-icon-sm" data-action="remove-completed" data-id="${t.id}" title="Move to trash"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>`).join('');
}

export function renderTrash(){
  const c=document.getElementById('trash-tasks'),e=document.getElementById('trash-empty'),eb=document.getElementById('btn-empty-trash');
  document.getElementById('trash-count').textContent=D.trash.length;
  if(!D.trash.length){c.innerHTML='';e.style.display='block';eb.style.display='none';return;}
  e.style.display='none';eb.style.display='block';
  c.innerHTML=D.trash.map(t=>{
    const ta=totalActual(t);
    return `<div class="trash-item animate-in">
      <div style="flex:1;">
        <div class="task-name">${esc(t.name)}</div>
        <div class="task-meta">${ta?ta+' pomodoro'+(ta>1?'s':''):''} ${t.deletedFrom?'from '+t.deletedFrom:''}</div>
      </div>
      <button class="restore-btn" data-action="restore-trash" data-id="${t.id}">Restore</button>
      <button class="btn-icon btn-icon-sm" data-action="remove-trash" data-id="${t.id}" title="Delete permanently"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>`;
  }).join('');
}

export function renderToday(){
  const c=document.getElementById('today-tasks'),e=document.getElementById('today-empty');
  if(!D.today.length){c.innerHTML='';e.style.display='block';return;}
  e.style.display='none';
  c.innerHTML=D.today.map(t=>`
    <div class="task-item ${t.completed?'completed':''} animate-in" data-task-id="${t.id}" draggable="true">
      <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
      <div class="task-check ${t.completed?'checked':''}" data-action="toggle-done" data-id="${t.id}"></div>
      <div class="task-content">
        <div class="task-name">${esc(t.name)} ${renderPriority(t,'today')}</div>
        ${renderAllShapes(t,'today')}
        <div class="task-meta">${renderIntMarks(t)}</div>
        ${!t.completed?renderSubtasks(t):''}
        ${!t.completed?renderReview(t,'today'):''}
      </div>
      <button class="btn-icon btn-icon-sm" data-action="remove-today" data-id="${t.id}" title="Remove" style="align-self:flex-start;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>`).join('');
  initDragDrop();
}

let draggedTaskId=null;

export function initDragDrop(){
  const container=document.getElementById('today-tasks');
  if(!container)return;
  container.querySelectorAll('.task-item').forEach(item=>{
    item.addEventListener('dragstart',e=>{draggedTaskId=item.dataset.taskId;item.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    item.addEventListener('dragend',()=>{item.classList.remove('dragging');container.querySelectorAll('.task-item').forEach(i=>i.classList.remove('drag-over'));draggedTaskId=null;});
    item.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';item.classList.add('drag-over');});
    item.addEventListener('dragleave',()=>item.classList.remove('drag-over'));
    item.addEventListener('drop',e=>{e.preventDefault();item.classList.remove('drag-over');if(!draggedTaskId||draggedTaskId===item.dataset.taskId)return;const fromIdx=D.today.findIndex(t=>t.id===draggedTaskId);const toIdx=D.today.findIndex(t=>t.id===item.dataset.taskId);if(fromIdx<0||toIdx<0)return;const [moved]=D.today.splice(fromIdx,1);D.today.splice(toIdx,0,moved);save();renderToday();renderTimerTaskList();});
  });
}

export function renderUnplanned(){document.getElementById('unplanned-tasks').innerHTML=D.unplanned.map(t=>`<div class="task-item ${t.completed?'completed':''}"><div class="task-check ${t.completed?'checked':''}" data-action="toggle-unplanned" data-id="${t.id}"></div><div class="task-content"><div class="task-name">${esc(t.name)}</div><div class="task-meta"><span class="tag tag-urgent">⚡ Unplanned</span></div></div></div>`).join('');}

export function renderTimerTaskList(){
  const c=document.getElementById('timer-task-list'),e=document.getElementById('timer-empty');
  const active=D.today.filter(t=>!t.completed);
  if(!active.length){c.innerHTML='';e.style.display='block';updateTTD();return;}
  e.style.display='none';
  c.innerHTML=active.map(t=>{const ta=totalActual(t);const be=t.est3||t.est2||t.estimate;
    return `<div class="task-option ${D.selectedTaskId===t.id?'selected':''}" data-action="select-timer-task" data-id="${t.id}"><div class="task-option-radio"></div><div style="flex:1;"><div class="task-option-text">${esc(t.name)}</div><div style="font-size:11px;color:var(--text3);margin-top:2px;">${ta} done${be?' / '+be+' est.':''}</div></div></div>`;}).join('');
  updateTTD();
}

export function updateTTD(){const t=D.today.find(x=>x.id===D.selectedTaskId);const n=document.getElementById('timer-task-name'),s=document.getElementById('timer-task-sub');if(t){n.textContent=t.name;const be=t.est3||t.est2||t.estimate;const ta=totalActual(t);s.textContent=`${ta}${be?'/'+be:''} Pomodoros`;}else{n.textContent='Select a task';s.textContent='Choose from Today list';}}

export function renderRecords(){
  const c=document.getElementById('records-list'),e=document.getElementById('records-empty');
  if(!D.records.length){c.innerHTML='';e.style.display='block';return;}
  e.style.display='none';
  const sorted=[...D.records].sort((a,b)=>b.date.localeCompare(a.date));
  c.innerHTML=sorted.map(r=>{
    const done=r.tasks.filter(t=>t.completed).length;
    const ints=r.tasks.reduce((s,t)=>s+(t.internalInt||0)+(t.externalInt||0),0);
    return `<div class="day-record animate-in"><div class="day-record-header"><div class="day-record-date">${fmtDate(r.date)}</div><div class="day-record-count">🍅 ${r.pomos}</div></div><div class="day-record-tasks">${done}/${r.tasks.length} tasks · ${ints} int.${r.unplanned?.length?' · '+r.unplanned.length+' unplanned':''}<br>${r.tasks.map(t=>{
      const ta=t.dayPomos||(t.actual1||0)+(t.actual2||0)+(t.actual3||0)||(t.actual||0);
      const ei=[t.estimate?'□'+t.estimate:'',t.est2?'○'+t.est2:'',t.est3?'△'+t.est3:''].filter(Boolean).join(' ');
      const subInfo=t.subtasks&&t.subtasks.length?` · ${t.subtasks.filter(s=>s.completed).length}/${t.subtasks.length} sub`:'';
      return `<span style="color:${t.completed?'var(--green)':'var(--text3)'};">${t.completed?'✓':'○'} ${esc(t.name)} — ${ta}🍅 (${ei||'—'})${subInfo}${t.review?' 📝':''}</span>`;
    }).join('<br>')}</div></div>`;
  }).join('');
}

export function updateStats(){
  document.getElementById('stat-today').textContent=D.todayPomos;document.getElementById('stat-total').textContent=D.totalPomos;
  if(D.records.length>0){
    const tot=D.records.reduce((s,r)=>s+r.pomos,0);
    document.getElementById('stat-avg').textContent=Math.round(tot/D.records.length*10)/10;
    let streak=0,cd=new Date();
    const hasToday=D.records.some(r=>r.date===TODAY);
    if(!hasToday&&D.todayPomos>0){streak=1;cd.setDate(cd.getDate()-1);}
    else if(!hasToday){cd.setDate(cd.getDate()-1);}
    for(let i=0;i<365;i++){const d=cd.toISOString().split('T')[0];if(D.records.some(r=>r.date===d)){streak++;cd.setDate(cd.getDate()-1);}else break;}
    document.getElementById('stat-streak').textContent=streak;
  }
}
