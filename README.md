# Pomodoro Planner

A complete Pomodoro Technique web app — plan, focus, track, and review. Single-file PWA, zero dependencies.

## Features

- **Activity Inventory** — Master backlog of tasks. Add tasks, then move them to Today when ready.
- **To Do Today** — Plan your day with Pomodoro estimates (1st/2nd/3rd re-estimation levels). Track unplanned & urgent tasks separately.
- **Focus Timer** — 25-minute work sessions with 5-minute short breaks and 20-minute long breaks (every 4th). Void or skip as needed.
- **Interrupt Tracking** — Mark internal (self-interruptions) and external interrupts during focus sessions.
- **Auto-Recording** — Pomodoros are automatically logged to daily records as they happen. Each pomodoro is attributed to the correct day, even for tasks spanning multiple days.
- **Completed Folder** — Finished inventory tasks move to a dedicated Completed section. Reopen or trash them anytime.
- **Trash & Restore** — Deleted tasks go to Trash instead of being lost forever. Restore to inventory or permanently delete.
- **Records & Charts** — Daily pomodoro bar chart (last 14 days), streak counter, daily average, all-time total.
- **9 Color Themes** — Dark and light modes with 9 palettes (Ember, Ocean, Sage, Lavender, Rose, Slate, Copper, Midnight, Sand).
- **Cloud Sync** — Sign in with Netlify Identity to sync data across devices.
- **Browser Notifications** — Get notified when a pomodoro or break ends, even if the tab is in the background.
- **Tab Timer** — Remaining time shown in the browser tab title.
- **PWA / Offline** — Install as a standalone app. Works offline after first visit.
- **Export / Import** — Full JSON data export and import with merge support.

## Quick Start

No build step required. Just deploy the folder to any static host.

### Netlify (recommended)
1. Sign up at [netlify.com](https://netlify.com)
2. Drag & drop this folder onto the Netlify dashboard
3. Done — you get a URL like `your-app.netlify.app`

### Other Options
- **Vercel**: `npm i -g vercel && vercel`
- **GitHub Pages**: Push to a repo, enable Pages in Settings
- **Cloudflare Pages**: Connect repo, set build output to `/`

## Project Structure

```
index.html        The entire app (HTML, CSS, JS inline)
manifest.json     PWA manifest (name, icons, theme color)
sw.js             Service worker (offline caching)
icons/            App icons (72px to 512px + maskable)
CHANGELOG.md      Version history
CLAUDE.md         AI assistant context file
```

## How It Works

### The Pomodoro Technique Flow
1. **Plan** — Add tasks to your Activity Inventory
2. **Estimate** — Move tasks to Today and set Pomodoro estimates
3. **Focus** — Start the timer, work for 25 minutes without interruption
4. **Record** — Pomodoros are auto-logged. Use "End Day" to archive when done.
5. **Review** — Check Records for daily charts, streaks, and task reviews

### Estimation Shapes
Tasks support 3 levels of estimation, following the Pomodoro Technique:
- **Squares** (1st estimate) — Your initial guess
- **Circles** (2nd estimate) — Re-estimate if you ran over
- **Triangles** (3rd estimate) — Final re-estimation

Shapes fill in as you complete pomodoros. If you exceed your estimate, extra squares are added automatically.

### Data Storage
- All data stored in browser localStorage
- Optional cloud sync via Netlify Identity (stores in user metadata)
- Export/import JSON for backups or migration

## Customizing

- **App name**: Edit `name` and `short_name` in `manifest.json`
- **Colors**: Edit `background_color` and `theme_color` in `manifest.json`
- **Icons**: Replace PNGs in `icons/` (keep same filenames and sizes)
- **Timer durations**: Modify `WT`, `SB`, `LB` constants in the JS section of `index.html`

## Tech Notes

- Zero dependencies — no npm, no build, no framework
- Single HTML file — all CSS and JS inline (~930 lines)
- Offline-first — localStorage for data, service worker for caching
- ~65KB total — loads instantly on any connection
