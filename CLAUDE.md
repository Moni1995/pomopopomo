# CLAUDE.md

## Project Overview
Pomodoro Planner — a single-page web app implementing the Pomodoro Technique. Plan tasks, run focus timers, track interrupts, and review daily records. Deployed on Netlify as a PWA.

## Architecture
- **Single file**: All HTML, CSS, and JS live in `index.html` (~930 lines). No build step, no bundler.
- **Service Worker**: `sw.js` provides offline caching (cache-first for app shell, network-first for fonts, network-only for `/.netlify/*` API calls).
- **PWA manifest**: `manifest.json` for installability.
- **Cloud sync**: Uses Netlify Identity (GoTrue) to store user data in `user_metadata.pomodoro`. No server-side database.

## Data Model
All state lives in a single `D` object persisted to `localStorage` (key: `pomo_v6` or `pomo_v6_{userId}`):
- `inventory[]` — Master task backlog (name, review)
- `today[]` — Today's tasks with estimates, actuals, interrupts, dailyPomos
- `completed[]` — Completed inventory tasks
- `trash[]` — Deleted tasks (restorable)
- `unplanned[]` — Unplanned/urgent tasks
- `records[]` — Daily snapshots (auto-recorded on each pomodoro + on "End Day")
- Scalars: `todayPomos`, `totalPomos`, `setCount`, `selectedTaskId`, `todayDate`, `lastModified`

## Key Patterns
- **Delegated click handling**: A single `document.addEventListener('click')` handler routes all UI actions via `data-action` attributes.
- **Estimation shapes**: Tasks use up to 3 levels of estimation (squares, circles, triangles) following the Pomodoro Technique's re-estimation pattern.
- **Auto-record**: `autoRecord()` is called on each pomodoro completion, automatically upserting today's record. No manual "End Day" needed (though it still works).
- **Migration**: `mig()` function handles upgrading old task schemas. Always check for new fields with defaults.

## Development
No dependencies, no build. Open `index.html` in a browser or deploy the repo root to any static host.

When modifying, bump `CACHE_NAME` in `sw.js` so returning users get the new code.

## Testing
Manual testing only. Open in browser, add tasks, run timer, verify records update. Check localStorage with devtools.
