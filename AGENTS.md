# PicFix — PWA

## Dev

```sh
cd pwa
npm run dev       # HTTPS dev server on local network (requires mkcert certs)
```

## Test

```sh
cd pwa && npm test       # vitest
cd pwa && npx tsc --noEmit
cd pwa && npx oxlint
cd pwa && npx vite build
```

## TDD Workflow

1. Write tests first
2. `npm test`
3. Implement to make tests pass
4. `npx oxlint && npx tsc --noEmit`
5. Verify on device: `npm run dev` → open HTTPS URL on Android Chrome

## Track Workflow

1. **On track completion:** move the track's directory from `conductor/tracks/` to `conductor/archive/` and update `conductor/tracks.md`.
2. **Commit after each track:** stage changes, show the user the diff, and ask for manual review before committing and pushing.

## PWA Notes

- HTTPS required for `getUserMedia` on non-localhost. Uses mkcert certs.
- No Expo, no React Native — pure Vite + React 19 + TypeScript.
- Storage: Dexie.js (IndexedDB).
- Camera: `navigator.mediaDevices.getUserMedia()`.
- Processing: Canvas 2D, no server uploads.
