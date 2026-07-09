# Spec: Server-Side Processing Pipeline

## What & why

The current client-side photo detection (`detectPhotoBounds`) finds a single axis-aligned rectangle via brightness scanning — it cannot handle multiple photos per capture, perspective distortion, or varying lighting. Moving complex CV to a Python (FastAPI + OpenCV) backend enables contour-based multi-photo detection, proper perspective correction, and auto-color correction that's impractical to match with client-side Canvas 2D alone.

## In scope

- **FastAPI backend** (`backend/`): Docker container with POST endpoint accepting multipart image upload
- **Multi-photo detection:** contour-finding algorithm that returns an array of detected regions (`DetectedRegion[]` with corners + confidence), handling 0, 1, or 2+ photos per capture
- **Auto-color correction:** histogram stretching / auto-levels + white balance correction on each detected region
- **PWA client integration:** upload captured image to server, display returned regions as crop suggestions in the crop screen, allow user to accept/reject each → save as separate photos
- **Graceful fallback:** if server is unreachable, fall back to current client-side `detectPhotoBounds` (single photo)

## Out of scope

- B&W colorization (future track)
- Face sharpening (future track)
- Cloud sync / storage (future track)
- User authentication / accounts
- Serving the PWA from the backend (PWA remains separate, served via Vite)
- Real-time video processing (processes single captured frames only)

## Acceptance criteria

1. `docker compose up` starts FastAPI with health endpoint; `POST /process` with a multipart image returns 200 with detected regions and corrected image blob.
2. Given a capture containing 2+ physical photos on a contrasting background, the server returns a `DetectedRegion[]` with at least the correct number of regions and `confidence > 0.5` for each.
3. Given a capture with no visible photo (uniform surface), the server returns an empty regions array — no crash.
4. The corrected image output has visibly improved white balance and contrast vs the raw input (verified via test fixtures with known ground truth).
5. PWA upload flow: capture → loading state → server returns regions → crop screen shows each region as a suggested crop → user taps "Accept" to save each as a separate photo record.
6. If the server is unreachable (network error / timeout), the app falls back to client-side detection with no crash or dead UI.

## Test approach

- **Backend:** pytest with sample image fixtures (single photo, multi-photo, uniform surface, low-light)
- **Client:** Vitest with mocked `fetch` for upload; component tests for the accept/reject UI
- **Integration:** Docker Compose test stack; E2E curl/Playwright against the running container
- Use realistic test images (actual printed photos on a desk, not synthetic gradients)

## Module structure

```
backend/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── app/
│   ├── main.py
│   ├── routers/process.py
│   ├── processing/
│   │   ├── detect.py       # contour-based multi-photo detection
│   │   ├── correct.py       # auto-color correction
│   │   └── models.py        # Pydantic models
│   └── tests/
│       ├── test_detect.py
│       ├── test_correct.py
│       └── test_process.py
```
