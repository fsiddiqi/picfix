# Tech Stack

## Phase 1 (MVP) — on-device only
- **Framework:** React Native + Expo
- **Camera:** `expo-camera` or `react-native-vision-camera`
- **CV processing:** OpenCV via native module (`processing/` module, pure
  functions, no UI/storage imports)
- **Local storage:** SQLite (`expo-sqlite`) for metadata, device
  filesystem for images
- **State management:** React Query or Zustand

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
