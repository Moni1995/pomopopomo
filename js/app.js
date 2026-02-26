/* ═══════════════════════════════════════════════════════════════ */
/* APP — Main entry point. Imports modules and wires everything. */
/* ═══════════════════════════════════════════════════════════════ */

import { D, save, replaceD, fresh, mig, load, getSK, TODAY, autoRecord,
         pickerSelectedIds, clearPickerSelectedIds, togglePickerSelectedId,
         showSyncToast, cloudSave, cloudLoad, switchUserData,
         debouncedCloudSave, ensureFields } from './store.js';
import { uid, esc, fmtDate, totalActual, liveDate } from './utils.js';
import { playTick } from './audio.js';
import { applyTheme, renderThemeGrid, setCurTheme, setCurMode } from './theme.js';
import { renderInventory, renderCompleted, renderTrash, renderToday,
         renderUnplanned, renderTimerTaskList, updateTTD,
         renderRecords, updateStats } from './render.js';
import { renderChart } from './chart.js';
import { updateTimerDisplay, updateControlsUI, updateSetCounter,
         initTimerListeners } from './timer.js';

/* ═══════════════════════════════════════ */
/* RENDER ALL                             */
/* ═══════════════════════════════════════ */
function renderAll() {
  renderInventory();
  renderCompleted();
  renderTrash();
  renderToday();
  renderUnplanned();
  renderTimerTaskList();
  renderRecords();
  updateStats();
  updateSetCounter();
  updateTimerDisplay();
  renderChart();
}

/* ═══════════════════════════════════════ */
/* NAVIGATION                             */
/* ═══════════════════════════════════════ */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.page).classList.add('active');
    renderAll();
  });
});
document.getElementById('timer-date').textContent = fmtDate(TODAY);
document.getElementById('today-date').textContent = fmtDate(TODAY);

/* ═══════════════════════════════════════ */
/* DELEGATED CLICK HANDLER                */
/* ═══════════════════════════════════════ */
document.addEventListener('click', function (e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action, id = el.dataset.id, src = el.dataset.src;

  if (action === 'fill-shape') {
    const lv = parseInt(el.dataset.level), idx = parseInt(el.dataset.index);
    const list = src === 'inv' ? D.inventory : D.today;
    const t = list.find(x => x.id === id);
    if (!t) return;
    const ak = 'actual' + lv;
    const cur = t[ak] || 0;
    if (idx < cur) {
      const diff = cur - idx;
      t[ak] = idx;
      if (src !== 'inv') { D.todayPomos = Math.max(0, D.todayPomos - diff); D.totalPomos = Math.max(0, D.totalPomos - diff); }
    } else {
      t[ak] = idx + 1;
      if (src !== 'inv') { D.todayPomos++; D.totalPomos++; }
    }
    save(); playTick();
    if (src === 'inv') renderInventory(); else { autoRecord(); renderToday(); renderTimerTaskList(); updateStats(); renderChart(); renderRecords(); }
  }
  else if (action === 'adj-est') {
    const lv = parseInt(el.dataset.level), delta = parseInt(el.dataset.delta);
    const list = src === 'inv' ? D.inventory : D.today;
    const t = list.find(x => x.id === id);
    if (!t) return;
    const ek = lv === 1 ? 'estimate' : 'est' + lv;
    t[ek] = Math.max(0, (t[ek] || 0) + delta);
    if (lv === 1 && t[ek] > 7) alert('Tasks >7 should be broken down.');
    save();
    if (src === 'inv') renderInventory(); else { renderToday(); renderTimerTaskList(); }
  }
  else if (action === 'toggle-done') {
    const t = D.today.find(x => x.id === id);
    if (!t) return;
    t.completed = !t.completed;
    if (t.invId) {
      if (t.completed) {
        const idx = D.inventory.findIndex(x => x.id === t.invId);
        if (idx >= 0) { const inv = D.inventory.splice(idx, 1)[0]; inv.completed = true; D.completed.push(inv); }
      } else {
        const idx = D.completed.findIndex(x => x.id === t.invId);
        if (idx >= 0) { const inv = D.completed.splice(idx, 1)[0]; inv.completed = false; D.inventory.push(inv); }
      }
    } else {
      if (t.completed) {
        const compEntry = { id: uid(), name: t.name, completed: true, review: t.review || '' };
        D.completed.push(compEntry);
        t.completedId = compEntry.id;
      } else {
        if (t.completedId) {
          D.completed = D.completed.filter(c => c.id !== t.completedId);
          delete t.completedId;
        }
      }
    }
    autoRecord(); save(); renderToday(); renderTimerTaskList(); renderInventory(); renderCompleted(); renderRecords();
  }
  else if (action === 'remove-today') {
    const t = D.today.find(x => x.id === id);
    if (t) { D.today = D.today.filter(x => x.id !== id); t.deletedFrom = 'today'; D.trash.push(t); }
    if (D.selectedTaskId === id) D.selectedTaskId = null;
    autoRecord(); save(); renderToday(); renderTimerTaskList(); renderTrash(); renderRecords();
  }
  else if (action === 'remove-inv') {
    const idx = D.inventory.findIndex(t => t.id === id);
    if (idx >= 0) { const t = D.inventory.splice(idx, 1)[0]; t.deletedFrom = 'inventory'; D.trash.push(t); }
    save(); renderInventory(); renderTrash();
  }
  else if (action === 'remove-completed') {
    const idx = D.completed.findIndex(t => t.id === id);
    if (idx >= 0) { const t = D.completed.splice(idx, 1)[0]; t.deletedFrom = 'completed'; D.trash.push(t); }
    save(); renderCompleted(); renderTrash();
  }
  else if (action === 'uncomplete-inv') {
    const idx = D.completed.findIndex(t => t.id === id);
    if (idx >= 0) { const t = D.completed.splice(idx, 1)[0]; t.completed = false; D.inventory.push(t); }
    save(); renderInventory(); renderCompleted();
  }
  else if (action === 'restore-trash') {
    const idx = D.trash.findIndex(t => t.id === id);
    if (idx >= 0) { const t = D.trash.splice(idx, 1)[0]; delete t.deletedFrom; t.completed = false; D.inventory.push(t); }
    save(); renderInventory(); renderTrash();
  }
  else if (action === 'remove-trash') {
    D.trash = D.trash.filter(t => t.id !== id);
    save(); renderTrash();
  }
  else if (action === 'toggle-collapse') {
    const tgt = el.dataset.target;
    const body = document.getElementById(tgt);
    const chev = el.querySelector('.collapse-chevron');
    if (body) { body.classList.toggle('open'); if (chev) chev.classList.toggle('open'); }
  }
  else if (action === 'send-today') { sendToToday(id); }
  else if (action === 'select-timer-task') { D.selectedTaskId = id; save(); renderTimerTaskList(); }
  else if (action === 'pick-inv') {
    togglePickerSelectedId(id);
    document.querySelectorAll('#inv-picker-list .task-option').forEach(o => o.classList.toggle('selected', pickerSelectedIds.has(o.dataset.id)));
  }
  else if (action === 'toggle-unplanned') {
    const t = D.unplanned.find(x => x.id === id);
    if (t) { t.completed = !t.completed; save(); renderUnplanned(); }
  }
  else if (action === 'toggle-review') {
    const area = document.getElementById('review-' + id);
    if (area) area.classList.toggle('open');
  }
  else if (action === 'save-review') {
    const list = src === 'inv' ? D.inventory : D.today;
    const t = list.find(x => x.id === id);
    if (!t) return;
    const ta = document.getElementById('review-text-' + id);
    if (ta) t.review = ta.value;
    save();
    const area = document.getElementById('review-' + id);
    if (area) area.classList.remove('open');
    if (src === 'inv') renderInventory(); else renderToday();
  }
  else if (action === 'toggle-subtask') {
    const t = D.today.find(x => x.id === id);
    if (!t || !t.subtasks) return;
    const subId = el.dataset.subid;
    const sub = t.subtasks.find(s => s.id === subId);
    if (sub) { sub.completed = !sub.completed; autoRecord(); save(); renderToday(); renderRecords(); }
  }
  else if (action === 'remove-subtask') {
    const t = D.today.find(x => x.id === id);
    if (!t || !t.subtasks) return;
    const subId = el.dataset.subid;
    t.subtasks = t.subtasks.filter(s => s.id !== subId);
    save(); renderToday();
  }
  else if (action === 'add-subtask') {
    const t = D.today.find(x => x.id === id);
    if (!t) return;
    const input = document.getElementById('subtask-input-' + id);
    if (!input) return;
    const name = input.value.trim();
    if (!name) return;
    if (!t.subtasks) t.subtasks = [];
    t.subtasks.push({ id: uid(), name, completed: false });
    input.value = '';
    autoRecord(); save(); renderToday(); renderRecords();
  }
  else if (action === 'cycle-priority') {
    const list = src === 'inv' ? D.inventory : D.today;
    const t = list.find(x => x.id === id);
    if (!t) return;
    const cycle = [null, 'low', 'medium', 'high'];
    const curIdx = cycle.indexOf(t.priority);
    t.priority = cycle[(curIdx + 1) % cycle.length];
    save();
    if (src === 'inv') renderInventory(); else { renderToday(); renderTimerTaskList(); }
  }
  else if (action === 'set-theme') {
    setCurTheme(el.dataset.id);
    applyTheme(); renderThemeGrid(); setTimeout(renderChart, 50);
  }
  else if (action === 'open-theme') { renderThemeGrid(); document.getElementById('modal-theme').classList.add('open'); }
  else if (action === 'open-identity') { if (typeof netlifyIdentity !== 'undefined') netlifyIdentity.open(); }
  else if (action === 'cloud-sync') { manualSync(el); }
});

/* ═══════════════════════════════════════ */
/* INVENTORY CRUD                         */
/* ═══════════════════════════════════════ */
function addInventoryTask() {
  const inp = document.getElementById('inv-task-input');
  const name = inp.value.trim();
  if (!name) return;
  D.inventory.push({ id: uid(), name, completed: false, review: '', priority: null });
  inp.value = '';
  save(); renderInventory(); inp.focus();
}

function sendToToday(invId, est) {
  const task = D.inventory.find(t => t.id === invId);
  if (!task) return;
  if (D.today.some(t => t.invId === invId)) { alert('Already on list.'); return; }
  D.today.push({ id: uid(), invId, name: task.name, estimate: est || 0, est2: 0, est3: 0, actual1: 0, actual2: 0, actual3: 0, internalInt: 0, externalInt: 0, completed: false, review: task.review || '', dailyPomos: {}, subtasks: [], priority: null });
  autoRecord(); save(); renderToday(); renderTimerTaskList(); renderRecords();
}

function openInventoryPicker() {
  clearPickerSelectedIds();
  const list = document.getElementById('inv-picker-list');
  const avail = D.inventory.filter(t => !D.today.some(td => td.invId === t.id));
  list.innerHTML = !avail.length
    ? '<div class="empty-state" style="padding:20px;"><p>No available tasks.</p></div>'
    : avail.map(t => `<div class="task-option" data-action="pick-inv" data-id="${t.id}"><div class="task-option-checkbox"></div><div><div class="task-option-text">${esc(t.name)}</div></div></div>`).join('');
  document.getElementById('modal-inv-picker').classList.add('open');
}

/* ═══════════════════════════════════════ */
/* TODAY CRUD                             */
/* ═══════════════════════════════════════ */
function addTodayTask() {
  const inp = document.getElementById('today-task-input'), ei = document.getElementById('today-est-input');
  const name = inp.value.trim();
  if (!name) return;
  const est = parseInt(ei.value) || 0;
  if (est > 7) { alert('Break down tasks >7.'); return; }
  D.today.push({ id: uid(), invId: null, name, estimate: est, est2: 0, est3: 0, actual1: 0, actual2: 0, actual3: 0, internalInt: 0, externalInt: 0, completed: false, review: '', dailyPomos: {}, subtasks: [], priority: null });
  inp.value = ''; ei.value = '';
  autoRecord(); save(); renderToday(); renderTimerTaskList(); renderRecords(); inp.focus();
}

function addUnplannedTask() {
  const inp = document.getElementById('unplanned-input');
  const name = inp.value.trim();
  if (!name) return;
  D.unplanned.push({ id: uid(), name, completed: false });
  inp.value = '';
  save(); renderUnplanned();
}

/* ═══════════════════════════════════════ */
/* CLEAR TODAY                             */
/* ═══════════════════════════════════════ */
function clearToday() {
  if (!confirm('Clear today?')) return;
  D.today = []; D.unplanned = []; D.selectedTaskId = null;
  save(); renderToday(); renderUnplanned(); renderTimerTaskList();
}

/* ═══════════════════════════════════════ */
/* EXPORT / IMPORT / RESET                */
/* ═══════════════════════════════════════ */
function exportData() {
  const b = new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' });
  const u = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = u; a.download = `pomodoro-${TODAY}.json`; a.click();
  URL.revokeObjectURL(u);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.records && !imported.inventory && !imported.today) { alert('Invalid file format.'); return; }
      const merge = D.records.length > 0 && confirm('Merge with existing data? (Cancel to replace)');
      if (merge) {
        if (imported.records) { imported.records.forEach(r => { const idx = D.records.findIndex(x => x.date === r.date); if (idx >= 0) D.records[idx] = r; else D.records.push(r); }); }
        if (imported.inventory) { imported.inventory.forEach(t => { if (!D.inventory.some(x => x.name === t.name)) D.inventory.push(t); }); }
        D.totalPomos = Math.max(D.totalPomos, imported.totalPomos || 0);
      } else {
        replaceD(imported);
      }
      ensureFields();
      save(); renderAll(); renderChart();
      alert('Data imported successfully!');
    } catch (err) { alert('Error reading file: ' + err.message); }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (!confirm('Delete ALL data?')) return;
  if (!confirm('Sure?')) return;
  replaceD(fresh());
  save(); renderAll(); renderChart();
}

/* ═══════════════════════════════════════ */
/* CLOUD SYNC                             */
/* ═══════════════════════════════════════ */
function updateUserBtns() {
  const user = typeof netlifyIdentity !== 'undefined' && netlifyIdentity.currentUser();
  const label = user ? (user.user_metadata && user.user_metadata.full_name ? user.user_metadata.full_name[0] : user.email[0]).toUpperCase() : '\u{1F464}';
  document.querySelectorAll('.user-btn').forEach(b => { b.textContent = label; b.title = user ? user.email : 'Sign in'; });
  document.querySelectorAll('.sync-btn').forEach(b => { b.classList.toggle('visible', !!user); });
}

async function manualSync() {
  const user = typeof netlifyIdentity !== 'undefined' && netlifyIdentity.currentUser();
  if (!user) { showSyncToast('Sign in to sync', false); return; }
  document.querySelectorAll('.sync-btn').forEach(b => b.classList.add('syncing'));
  try {
    const cloud = await cloudLoad();
    if (cloud) {
      const ct = cloud.lastModified || 0, lt = D.lastModified || 0;
      if (ct > lt) {
        replaceD(cloud);
        try { localStorage.setItem(getSK(), JSON.stringify(D)); } catch (e) { /* ignore */ }
        ensureFields();
        renderAll();
        showSyncToast('Pulled from cloud', true);
      } else {
        const ok = await cloudSave();
        showSyncToast(ok ? 'Pushed to cloud' : 'Sync failed', ok);
      }
    } else {
      const ok = await cloudSave();
      showSyncToast(ok ? 'Pushed to cloud' : 'Sync failed', ok);
    }
  } catch (e) { console.warn('Sync failed:', e); showSyncToast('Sync failed', false); }
  document.querySelectorAll('.sync-btn').forEach(b => b.classList.remove('syncing'));
}

/* ═══════════════════════════════════════ */
/* WIRE UP EVENT LISTENERS                */
/* ═══════════════════════════════════════ */

// Inventory
document.getElementById('btn-add-inv').addEventListener('click', addInventoryTask);
document.getElementById('inv-task-input').addEventListener('keypress', e => { if (e.key === 'Enter') addInventoryTask(); });
document.getElementById('btn-pick-inv').addEventListener('click', openInventoryPicker);
document.getElementById('btn-close-picker').addEventListener('click', () => document.getElementById('modal-inv-picker').classList.remove('open'));
document.getElementById('btn-confirm-pick').addEventListener('click', () => {
  if (!pickerSelectedIds.size) return;
  pickerSelectedIds.forEach(id => sendToToday(id, 0));
  document.getElementById('modal-inv-picker').classList.remove('open');
});

// Today
document.getElementById('btn-add-today').addEventListener('click', addTodayTask);
document.getElementById('today-task-input').addEventListener('keypress', e => { if (e.key === 'Enter') addTodayTask(); });
document.getElementById('btn-add-unplanned').addEventListener('click', addUnplannedTask);
document.getElementById('unplanned-input').addEventListener('keypress', e => { if (e.key === 'Enter') addUnplannedTask(); });
document.getElementById('btn-clear-day').addEventListener('click', clearToday);
document.getElementById('btn-empty-trash').addEventListener('click', () => {
  if (!confirm('Permanently delete all trashed tasks?')) return;
  D.trash = []; save(); renderTrash();
});

// Timer
initTimerListeners();

// Theme
document.getElementById('btn-close-theme').addEventListener('click', () => document.getElementById('modal-theme').classList.remove('open'));
document.getElementById('mode-dark').addEventListener('click', () => {
  setCurMode('dark'); applyTheme(); renderThemeGrid(); setTimeout(renderChart, 50);
});
document.getElementById('mode-light').addEventListener('click', () => {
  setCurMode('light'); applyTheme(); renderThemeGrid(); setTimeout(renderChart, 50);
});

// Data
document.getElementById('btn-export').addEventListener('click', exportData);
document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-import').click());
document.getElementById('file-import').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });
document.getElementById('btn-reset').addEventListener('click', clearAllData);

// Modals
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// Responsive chart
window.addEventListener('resize', () => renderChart());

/* ═══════════════════════════════════════ */
/* INITIALIZE                             */
/* ═══════════════════════════════════════ */
applyTheme();
renderAll();
updateControlsUI();

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW registered:', reg.scope);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (nw) nw.addEventListener('statechange', () => {
            if (nw.state === 'activated' && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        });
      })
      .catch(err => console.log('SW registration failed:', err));
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
}

// Netlify Identity
if (typeof netlifyIdentity !== 'undefined') {
  netlifyIdentity.on('init', async u => { if (u) await switchUserData(true); updateUserBtns(); renderAll(); });
  netlifyIdentity.on('login', async () => { netlifyIdentity.close(); await switchUserData(true); updateUserBtns(); renderAll(); });
  netlifyIdentity.on('logout', async () => { await switchUserData(false); updateUserBtns(); renderAll(); });
}
