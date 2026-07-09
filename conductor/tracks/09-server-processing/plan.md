# Track 09: Server-Side Processing Pipeline

Moves complex CV processing from the PWA client to a Python (FastAPI) backend. The client sends captured images to the server, which returns detected photo regions and corrected images.

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: FastAPI Backend Setup
- [ ] 1.1 Scaffold FastAPI project (`backend/`), health endpoint
- [ ] 1.2 Dockerize: `Dockerfile` + `docker-compose.yml` (FastAPI + Celery + Redis)
- [ ] 1.3 Accept multipart image upload, return processed result as JSON + blob
- [ ] 1.4 CORS config for PWA dev server
- [ ] **Checkpoint:** `POST /process` returns 200 with mock result

## Phase 2: Multi-Photo Detection (OpenCV)
- [ ] 2.1 `process_image()` pipeline: receive raw capture, detect photo regions via contour finding (not single-axis scan)
- [ ] 2.2 Return `DetectedRegion[]` with corners + confidence per region
- [ ] 2.3 Handle 0, 1, and 2+ photos gracefully
- [ ] 2.4 Integration test with sample images
- [ ] **Checkpoint:** upload multi-photo capture → server returns correct region array

## Phase 3: Auto-Color Correction
- [ ] 3.1 Histogram stretching / auto-levels per channel
- [ ] 3.2 White balance correction (gray-world or similar)
- [ ] 3.3 Return corrected image blob alongside detected regions
- [ ] 3.4 Tests: before/after comparison on known test fixtures
- [ ] **Checkpoint:** corrected image output is visibly improved vs raw capture

## Phase 4: PWA Client Integration
- [ ] 4.1 Upload captured image to `POST /process` (with loading state)
- [ ] 4.2 Display returned regions as crop suggestions in the crop screen
- [ ] 4.3 Allow user to accept/reject each suggested region → save as separate photos
- [ ] 4.4 Replace `detectPhotoBounds` client-side call with server result
- [ ] 4.5 Fallback to client-side detection if server unreachable
- [ ] 4.6 Tests: mock server response → correct UI behavior
- [ ] **Checkpoint:** capture → server processes → user sees detected photos → saves

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
