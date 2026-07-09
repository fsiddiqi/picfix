# Tech Stack

## Platform: PWA
Android + desktop are the priority targets; iOS is secondary (see
`product.md` for the accepted iOS camera/storage risk).

## Phase 1 (MVP) — client-side only, no backend
- **Framework:** React + Vite, built as a PWA (Web App Manifest + service
  worker via `vite-plugin-pwa` or equivalent)
- **Camera:** `navigator.mediaDevices.getUserMedia()` → `<video>` element →
  `<canvas>` frame capture
- **CV processing:** `opencv.js` (WASM build), loaded in a Web Worker so it
  doesn't block the UI thread. Wrapped by the `processing/` module — pure
  functions, no UI/storage imports, same contract as before.
- **Local storage:**
  - Metadata: IndexedDB (via `idb` or Dexie.js)
  - Image blobs: Origin Private File System (OPFS) if available, falling
    back to IndexedDB blob storage otherwise
  - Request `navigator.storage.persist()` on first launch to reduce
    eviction risk; still not a guarantee (see accepted risk in
    `product.md`)
- **State management:** React Query or Zustand

## Phase 2 — adds backend
- **Backend:** FastAPI (Python), containerized
- **Queue:** Celery + Redis
- **DB:** Postgres (mirrors IndexedDB schema field-for-field where possible)
- **Storage:** S3-compatible object storage
- **AI enhancement:** `ImageEnhancer` interface wrapping a third-party API
  or self-hosted model — swappable, never hardcode a vendor's request/
  response shape outside the adapter
- **Payments:** Stripe Checkout / Billing (web-based; no app-store cut)

## Module boundaries (all phases)
- `capture/` — camera UI only (video element, canvas capture), no
  processing logic
- `processing/` — pure functions: image data in, image data out
  (`ImageBitmap`/`Blob` in, not file paths — there's no native filesystem).
  No UI, no storage. Runs in a Web Worker; testable headlessly via
  Playwright or Node + `node-canvas`/WASM without a real browser.
- `storage/` — IndexedDB/OPFS (phase 1) or Postgres/S3 (phase 2) access,
  no processing logic
- `albums/` — UI screens/components, calls into `storage/` and
  `processing/`

Keeping `processing/` pure and isolated is the single most important
constraint — do not let any change blur this boundary.

## Testing environment
- Unit/processing tests: run in a headless browser context (Playwright)
  since `opencv.js` WASM needs a browser-like environment — plain Node
  without a DOM/WASM shim will not work for these tests.
- Component tests: React Testing Library.
- E2E: Playwright, including a real `getUserMedia` mock for camera flows.
