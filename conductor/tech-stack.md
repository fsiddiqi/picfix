# Tech Stack

## Phase 1 (MVP) — on-device only

Two delivery tracks are maintained:

### PWA (primary — see Track 05)
- **Framework:** React 18 + Vite + TypeScript
- **Camera:** `navigator.mediaDevices.getUserMedia()` → `<video>` + `<canvas>`
- **CV processing:** Pure TypeScript functions (`processing/` module, no
  DOM/IO imports); Web Workers for heavy pixel ops
- **Local storage:** IndexedDB via Dexie.js (Blob storage + metadata)
- **State management:** React hooks + context (no external lib needed)
- **Testing:** Vitest + `@testing-library/react` + `fake-indexeddb`
- **PWA:** `vite-plugin-pwa` for service worker + manifest; fully offline
  after first load
- **Deployment:** Static host (Netlify, Vercel, Cloudflare Pages); no app
  stores

### React Native (legacy — phased out)
- **Framework:** React Native + Expo (SDK 56, pinned)
- **Camera:** `expo-camera`
- **CV processing:** OpenCV via native module
- **Local storage:** SQLite (`expo-sqlite`) for metadata, device
  filesystem for images
- **Gating issue:** Expo Go does not support Android 16; requires dev
  build or iOS only

## Phase 2 — adds backend
- **Backend:** FastAPI (Python), containerized
- **Queue:** Celery + Redis
- **DB:** Postgres (mirrors SQLite schema field-for-field where possible)
- **Storage:** S3-compatible object storage
- **AI enhancement:** `ImageEnhancer` interface wrapping a third-party API
  or self-hosted model — swappable, never hardcode a vendor's request/
  response shape outside the adapter
- **Payments:** RevenueCat / Stripe

## Module boundaries (all phases)
- `capture/` — camera UI only, no processing logic
- `processing/` — pure functions: image in, image out. No UI, no storage.
  This is what gets fast, deterministic unit tests against fixture images.
- `storage/` — SQLite/Postgres + filesystem/S3 access, no processing logic
- `albums/` — UI screens, calls into `storage/` and `processing/`

Keeping `processing/` pure and isolated is the single most important
constraint — do not let any change blur this boundary.
