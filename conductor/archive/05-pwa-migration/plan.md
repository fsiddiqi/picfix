# Track 05: Core PWA (Capture + Browse)

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: PWA Scaffold
- [x] Vite + React 19 + TypeScript project initialized
- [x] VitePWA plugin configured (Workbox generateSW, manifest with standalone display)
- [x] Module boundaries established: `capture/`, `processing/`, `storage/`, `albums/`
- [x] Dexie.js IndexedDB schema (Album/Photo tables, `ensureUnsortedAlbum`, `insertPhoto`, `getPhotos`)
- [x] HTTPS dev server via mkcert certs for local network access
- [x] Vitest + jsdom + fake-indexeddb test environment
- [x] TDD workflow verified: `npx vitest run`, `npx tsc --noEmit`, `npx oxlint`, `npx vite build`

## Phase 2: Camera Capture
- [x] `getUserMedia({ video: { facingMode: 'environment' } })` → `<video>` preview
- [x] Permission states: prompt → granted/denied, retry button when denied
- [x] `captureFrame(video)`: capture video frame to `<canvas>` → JPEG Blob
- [x] Save full-res photo + thumbnail (200px) + metadata to IndexedDB on capture
- [x] Busy indicator while capturing, button disabled during async save

## Phase 3: Album Browsing
- [x] Album list screen: fetch all albums, show cover thumbnail + photo count
- [x] Photo grid screen: 3-column thumbnail grid within album
- [x] Tap album → enter grid; tap photo → open full-res in new tab
- [x] Navigation between Capture and Albums (Albums button, + FAB)

## Phase 4: Testing & Verification
- [x] 20 tests passing (capture-frame, capture-screen, thumbnail, storage, module-boundaries)
- [x] TypeScript, lint, production build all clean
- [x] Verified on Android Chrome over HTTPS local network

## Next
See Track 06 (App Shell), Track 07 (Image Processing), Track 08 (Album Management), Track 09 (Data Portability).
