# Track 06: PWA App Shell & Installability

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: App Shell Architecture
- [ ] 1.1 App shell pattern: render shell immediately, lazy-load screens
- [ ] 1.2 Navigation transitions (slide/fade between capture/albums/photos)
- [ ] 1.3 Bottom tab or sidebar nav pattern for mobile thumbs
- [ ] 1.4 Viewport meta, safe-area insets, status bar styling
- [ ] **Checkpoint:** app shell loads instantly with nav; screens lazy-load

## Phase 2: Manifest Polish
- [ ] 2.1 Full manifest: short_name, description, categories, screenshots
- [ ] 2.2 Icon set: 48–512px PNGs (incl. maskable), SVG favicon
- [ ] 2.3 Splash screen via `screenshots` + background_color
- [ ] 2.4 Theme color, background color, display: standalone
- [ ] **Checkpoint:** Lighthouse PWA audit passes installability checks

## Phase 3: Service Worker & Caching Strategy
- [ ] 3.1 Evaluate Workbox strategies: StaleWhileRevalidate for app shell, CacheFirst for assets
- [ ] 3.2 Offline fallback page when no connectivity
- [ ] 3.3 IndexedDB-backed photo cache hint for SW (skip caching blobs)
- [ ] 3.4 Manual SW update prompt ("Update available" toast)
- [ ] **Checkpoint:** app loads and functions with dev tools offline checked

## Phase 4: Add to Home Screen
- [ ] 4.1 `beforeinstallprompt` event listener + deferred prompt
- [ ] 4.2 Custom install button (banner or nav bar)
- [ ] 4.3 `appinstalled` event → analytics/toast
- [ ] 4.4 Test A2HS on Android Chrome, verify standalone mode
- [ ] **Checkpoint:** app installable via custom prompt, launches standalone

## Definition of Done
Lighthouse PWA badge, A2HS prompt works, offline fallback displayed when offline.
