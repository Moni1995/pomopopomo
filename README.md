# 🍅 Pomodoro Planner — PWA Deployment Guide

## What's in this folder

```
pomodoro-pwa/
├── index.html          ← The app (single file, all CSS/JS inline)
├── manifest.json       ← PWA manifest (name, icons, theme)
├── sw.js               ← Service worker (offline caching)
├── icons/              ← App icons (72px to 512px + maskable)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── icon-maskable-512x512.png
└── README.md           ← This file
```

## Quickest deployment options

### 1. Netlify (Free — recommended for starting out)
1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag & drop this entire folder onto the Netlify dashboard
3. Done. You get a URL like `pomodoro-planner.netlify.app`
4. (Optional) Connect a custom domain in Site Settings → Domain Management

### 2. Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. In this folder, run: `vercel`
3. Follow prompts — deployed in seconds

### 3. GitHub Pages (Free)
1. Create a new GitHub repo
2. Push this folder's contents to the `main` branch
3. Go to Settings → Pages → set source to `main` branch
4. Your app lives at `yourusername.github.io/repo-name`
5. Update `start_url` in manifest.json to match: `"/repo-name/index.html"`

### 4. Cloudflare Pages (Free)
1. Push to GitHub/GitLab
2. Connect repo in Cloudflare Pages dashboard
3. Set build output to `/` (no build step needed)

## How installation works

Once deployed on HTTPS:
- **Chrome/Edge (desktop):** Users see an install icon in the address bar → click to install
- **Chrome (Android):** "Add to Home Screen" banner appears automatically after a few visits
- **Safari (iOS):** Users tap Share → "Add to Home Screen"

The service worker caches the app, so it works fully offline after first visit.

## After deploying — testing the PWA

1. Open Chrome DevTools → Application tab
2. Check "Manifest" section — should show your app info and icons
3. Check "Service Workers" section — should show sw.js registered
4. Run a Lighthouse audit (Performance tab) — aim for a PWA badge ✅

## Customizing

- **App name:** Edit `name` and `short_name` in `manifest.json`
- **Colors:** Edit `background_color` and `theme_color` in `manifest.json`
- **Icons:** Replace PNGs in `icons/` with your own designs (keep same filenames/sizes)
- **Domain:** Update `start_url` in manifest.json if not serving from root

## Adding a paywall later

When you're ready to gate premium features:
1. Add Stripe or Lemon Squeezy checkout
2. Store a `premium: true` flag in localStorage after payment
3. Gate features like analytics/charts, data export, and cloud sync behind that flag
4. For server-side verification, add a simple API (Cloudflare Workers is free and fast)

## Tech notes

- **Zero dependencies** — no npm, no build step, no framework
- **Single HTML file** — all CSS and JS are inline
- **Offline-first** — localStorage for data, service worker for caching
- **~65KB total** — loads instantly on any connection
