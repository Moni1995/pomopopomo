# Changelog

## v2.0.0 — 2026-02-19

### New Features
- **Completed Folder** — Completed inventory tasks now move to a dedicated "Completed" section in the Inventory page. Tasks can be reopened (moved back to active inventory) or deleted (moved to trash).
- **Trash** — Deleted tasks are moved to a Trash section instead of being permanently removed. Tasks can be restored to inventory or permanently deleted. "Empty Trash" clears all trashed items at once.
- **Automatic Pomodoro Logging** — Pomodoros are now automatically recorded to daily tracking as they are completed. Each pomodoro is timestamped and attributed to the correct day, even if a task spans multiple days. The "End Day" button still works but is no longer required for records to appear.
- **Per-Day Pomodoro Attribution** — Tasks track `dailyPomos` per date. Records show how many pomodoros were done on each specific day, not cumulative totals.
- **Browser Notifications** — Desktop notifications fire when a pomodoro or break completes (permission requested on first timer start). Useful when the tab is in the background.
- **Timer in Tab Title** — The remaining time (`12:34 — Pomodoro`) is shown in the browser tab title during active sessions.

### Bug Fixes
- **Service Worker cached identity API requests** — `/.netlify/*` requests were being served from cache, causing cloud sync (`cloudLoad`) to return stale user data. These are now excluded from caching (network-only).
- **Service Worker cache version bumped** (v4 → v5) — Old cached code (including broken Blobs function URLs from a previous architecture) is now evicted on deploy.
- **Streak calculation fixed** — Previously showed 0 if the user had active pomodoros today but hadn't clicked "End Day". Now counts today's session toward the streak.
- **Timer ring math simplified** — `CIRC*(1-(1-timeLeft/totalTime))` simplified to `CIRC*(timeLeft/totalTime)`. Same behavior, clearer code.
- **Midnight crossing handled** — If a user works past midnight, the day boundary is detected on the next pomodoro completion. The old day's record is finalized and the new day starts fresh.

### Internal
- Data model now includes `completed[]`, `trash[]`, and `dailyPomos{}` per task.
- Migration code handles upgrading existing data to the new schema.
- Import/export and cloud sync updated to handle new fields.

---

## v1.0.0 — Initial Release

- Full Pomodoro Technique implementation: Inventory, Today, Timer, Records
- Multi-level estimation (1st/2nd/3rd) with shape visualization
- Internal/external interrupt tracking
- 9 color themes with dark/light mode
- Chart visualization of daily pomodoro counts
- Cloud sync via Netlify Identity (GoTrue)
- PWA support with offline capability
- Export/import JSON data
