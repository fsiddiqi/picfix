# Track 06: PWA App Shell & Installability

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: App Shell Architecture
- [x] 1.1 App shell pattern: render shell immediately, lazy-load screens
- [x] 1.2 Navigation transitions (slide/fade between capture/albums/photos)
- [x] 1.3 Bottom tab or sidebar nav pattern for mobile thumbs
- [x] 1.4 Viewport meta, safe-area insets, status bar styling
- [x] **Checkpoint:** app shell loads instantly with nav; screens lazy-load

## Phase 2: Manifest Polish
- [x] 2.1 Full manifest: short_name, description, categories, screenshots
- [x] 2.2 Icon set: 48–512px PNGs (incl. maskable), SVG favicon
- [x] 2.3 Splash screen via `screenshots` + background_color
- [x] 2.4 Theme color, background color, display: standalone
- [x] **Checkpoint:** Lighthouse PWA audit passes installability checks

## Phase 3: Service Worker & Caching Strategy
- [x] 3.1 Workbox StaleWhileRevalidate for precached assets, navigateFallback for offline
- [x] 3.2 Offline fallback page (`public/offline.html`)
- [x] 3.3 IndexedDB blobs excluded from SW cache (no fetch URL to cache)
- [x] 3.4 SW update prompt (`UpdatePrompt` component using `useRegisterSW`)
- [x] **Checkpoint:** app loads offline if previously visited; update prompt appears

## Phase 4: Add to Home Screen
- [x] 4.1 `beforeinstallprompt` event listener + deferred prompt (`useInstallPrompt` hook)
- [x] 4.2 Custom install button (`InstallBanner` component)
- [x] 4.3 `appinstalled` event tracked as installed state
- [ ] 4.4 Test A2HS on Android Chrome, verify standalone mode *(manual)*
- [x] **Checkpoint:** app prompts install on supported browsers

## Definition of Done
Lighthouse PWA badge, A2HS prompt works, offline fallback displayed when offline.
