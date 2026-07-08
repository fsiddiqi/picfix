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

## Branching Workflow

1. `main` is stable/released. `dev` is the integration branch.
2. For each track, create a feature branch from `dev`: `git checkout dev && git checkout -b track-NN-description`
3. Do all work on the feature branch, committing as needed.
4. On completion: run full test suite (`npm test`, `npx tsc --noEmit`, `npx oxlint`, `npx vite build`).
5. Stage, show diff, ask for manual review.
6. On approval: merge into `dev` (`git checkout dev && git merge track-NN-description`), then push.
7. Delete the feature branch (`git branch -d track-NN-description`).
8. Periodically merge `dev` into `main` when tracks are stable.

## PWA Notes

- HTTPS required for `getUserMedia` on non-localhost. Uses mkcert certs.
- No Expo, no React Native — pure Vite + React 19 + TypeScript.
- Storage: Dexie.js (IndexedDB).
- Camera: `navigator.mediaDevices.getUserMedia()`.
- Processing: Canvas 2D, no server uploads.
