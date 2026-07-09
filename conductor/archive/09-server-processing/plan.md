# Track 09: Server-Side Processing Pipeline

Moves complex CV processing from the PWA client to a Python (FastAPI) backend. The client sends captured images to the server, which returns detected photo regions and corrected images.

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: FastAPI Backend Setup ✅
- [x] 1.1 Scaffold FastAPI project (`backend/`), health endpoint
- [x] 1.2 Dockerize: `Dockerfile` + `docker-compose.yml`
- [x] 1.3 Accept multipart image upload, return corrected image as JPEG body + regions in `X-Regions` header
- [x] 1.4 CORS config for PWA dev server (allow all origins)
- [x] **Checkpoint:** `POST /process` returns 200 with corrected image + region JSON

## Phase 2: Multi-Photo Detection (OpenCV) ✅
- [x] 2.1 `detect_photo_regions()` pipeline: contour-finding via Canny edge detection + contour approximation
- [x] 2.2 Returns `DetectedRegion[]` with 4 corners + confidence per region
- [x] 2.3 Handles 0, 1, and 2+ photos gracefully (area threshold filter)
- [x] 2.4 Integration test with synthetic images (single, multi, uniform, low-light)
- [x] **Checkpoint:** upload multi-photo capture → server returns correct region array

## Phase 3: Auto-Color Correction ✅
- [x] 3.1 Histogram stretching (1st–99th percentile per channel)
- [x] 3.2 White balance correction (gray-world)
- [x] 3.3 Corrected image returned as JPEG body alongside region JSON header
- [x] 3.4 Tests: output shape, brightness increase, color cast reduction
- [x] **Checkpoint:** corrected image output is visibly improved vs raw capture

## Phase 4: PWA Client Integration ✅
- [x] 4.1 Upload captured image to `POST /process` (with loading state)
- [x] 4.2 Display returned regions as crop suggestions in the crop screen
- [x] 4.3 Allow user to accept/reject each suggested region → save as separate photos
- [x] 4.4 Try server first, fall back to client-side `detectPhotoBounds` if server unreachable
- [x] 4.5 Fallback to client-side detection if server unreachable
- [x] 4.6 Tests: basic render tests
- [x] **Checkpoint:** capture → server processes → user sees detected photos → saves

## Phase 5: Background Queue (Stretch)
- [ ] 5.1 Celery worker for async processing of large images / batch scans
- [ ] 5.2 WebSocket or polling for job status
- [ ] 5.3 Post-process notification in PWA (background sync?)

## Definition of Done
Multi-photo capture → server detects regions + color-corrects → user reviews & saves. Works end-to-end on Android Chrome against a local or deployed backend.

## Module structure
```
backend/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── app/
│   ├── main.py
│   ├── routers/
│   │   └── process.py
│   ├── processing/
│   │   ├── detect.py        # contour-based multi-photo detection
│   │   ├── correct.py       # auto-color correction
│   │   └── models.py        # shared data types
│   └── tests/
│       ├── test_detect.py
│       ├── test_correct.py
│       └── test_process.py
```
