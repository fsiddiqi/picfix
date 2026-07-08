# Spec: PWA Migration

## What & why

Replace the current React Native + Expo codebase with a Progressive Web App
(PWA) built on standard web APIs. This eliminates native SDK version headaches
(user's Android 16 + Expo Go incompatibility), allows instant deployment
without an app store, and keeps the core product scope (offline camera capture,
cropping, album management) fully intact.

## In scope

- New project scaffold: React + Vite + TypeScript + Vitest
- PWA manifest (`manifest.json`) + service worker for offline support
- Camera via `navigator.mediaDevices.getUserMedia()` — render to `<video>`,
  capture frames to `<canvas>`, save as Blob
- Storage via IndexedDB (Dexie.js wrapper): photo Blobs, album metadata,
  photo-to-alarm mapping — replaces `expo-sqlite` + `expo-file-system/legacy`
- Capture screen: live `<video>` preview, capture button, permission handling
- Albums screen: list albums, view photos in an album
- Crop & correct screen: basic canvas-based crop + rotation (Web Workers for
  any heavy pixel work)
- Photo metadata editing (title, date, caption)
- Preserve all existing architectural boundaries (`capture/`, `processing/`,
  `storage/`, `albums/`) with same module boundary rules

## Out of scope

- Push notifications
- Background sync
- Native file system access (no `showDirectoryPicker` / File System Access API)
- Backend / cloud sync — stays offline-first (Phase 2 if needed)

## Acceptance criteria

1. `npm run dev` starts Vite dev server; the app loads in Chrome on
   Android 16 without any native build step.
2. Camera capture works on Android Chrome using `getUserMedia`; captured
   frames are stored as Blobs in IndexedDB.
3. Offline: app loads and functions with no network (service worker caches
   shell + assets).
4. All four module boundaries (`capture/`, `processing/`, `storage/`,
   `albums/`) are present; `processing/` remains pure (no DOM/IO).
5. Test suite passes: Vitest for unit tests, `@testing-library/react` for
   component tests, no headless device required.
6. PWA install prompt appears on Android Chrome after first visit.
7. Album listing and photo browsing works from stored IndexedDB data.

## Test approach

- Unit tests via Vitest (fast, native ESM, no Jest config complexity)
- Component tests via `@testing-library/react` with mocked `getUserMedia`
- Storage tests via `fake-indexeddb` (in-memory IndexedDB polyfill)
- E2E verification on real Android Chrome on Android 16
