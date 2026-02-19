# CLAUDE.md

## Project Overview
Pomodoro Planner — a single-page web app implementing the Pomodoro Technique. Plan tasks, run focus timers, track interrupts, and review daily records. Deployed on Netlify as a PWA.

## Architecture
Modular ES-module architecture. No build step, no bundler — uses native `<script type="module">`.

### File Structure
```
index.html          — Clean HTML shell (markup only, ~130 lines)
css/styles.css      — All styles, organized by section
js/
  app.js            — Main entry: imports all modules, event wiring, CRUD, init
  utils.js          — Pure utilities: uid, esc, fmtDate, totalActual, liveDate
  store.js          — Data layer: D, save/load, migration, cloud sync, autoRecord
  audio.js          — Web Audio API: playTick, playRing, resumeAudio
  theme.js          — Theme system: 9 themes × dark/light, applyTheme, setCurTheme/Mode
  shapes.js         — Estimation shapes: □○△ rendering, renderAllShapes, renderIntMarks
  render.js         — Page rendering: inventory, today, records, stats, timer task list
  timer.js          — Timer state machine: start/pause/tick/complete, interrupts, set counter
  chart.js          — Canvas bar chart for daily pomodoro records
sw.js               — Service Worker: offline caching for all modules
manifest.json       — PWA manifest for installability
```

### Module Dependency Graph (no circular deps)
```
utils.js ──────────────────────────────────────┐
audio.js ──────────────────────────────────────┤
theme.js ──────────────────────────────────────┤
store.js ← utils                               │
shapes.js ← utils                              ├── app.js
render.js ← store, utils, shapes               │
chart.js ← store                               │
timer.js ← store, audio, utils, render, chart  │
                                               ┘
```

- **Service Worker**: `sw.js` caches all assets (HTML, CSS, 8 JS modules, icons). Cache-first for app shell, network-first for fonts, network-only for `/.netlify/*` API calls.
- **Cloud sync**: Uses Netlify Identity (GoTrue) to store user data in `user_metadata.pomodoro`. No server-side database.

## Data Model
All state lives in a single `D` object (exported from `store.js`) persisted to `localStorage` (key: `pomo_v6` or `pomo_v6_{userId}`):
- `inventory[]` — Master task backlog (name, review)
- `today[]` — Today's tasks with estimates, actuals, interrupts, dailyPomos
- `completed[]` — Completed inventory tasks
- `trash[]` — Deleted tasks (restorable)
- `unplanned[]` — Unplanned/urgent tasks
- `records[]` — Daily snapshots (auto-recorded on each pomodoro + on "End Day")
- Scalars: `todayPomos`, `totalPomos`, `setCount`, `selectedTaskId`, `todayDate`, `lastModified`

## Key Patterns
- **ES Modules**: Native browser modules (`<script type="module">`). Modules are deferred, so DOM is ready when they execute. Shared state (`D`) uses `export let` live bindings.
- **Delegated click handling**: A single `document.addEventListener('click')` handler in `app.js` routes all UI actions via `data-action` attributes.
- **Estimation shapes**: Tasks use up to 3 levels of estimation (squares, circles, triangles) following the Pomodoro Technique's re-estimation pattern.
- **Auto-record**: `autoRecord()` is called on each pomodoro completion, automatically upserting today's record.
- **Migration**: `mig()` function in `store.js` handles upgrading old task schemas. Always check for new fields with defaults.

## Development
No dependencies, no build. Serve the repo root with any static server (or deploy to Netlify). ES modules require `http://` (not `file://`).

When modifying, bump `CACHE_NAME` in `sw.js` so returning users get the new code.

## Testing
Manual testing only. Open in browser, add tasks, run timer, verify records update. Check localStorage with devtools.
