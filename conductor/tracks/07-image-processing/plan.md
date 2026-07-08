# Track 07: Image Processing Pipeline

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

All processing runs client-side via Canvas 2D / WebGL — zero uploads.

## Phase 1: Crop & Perspective Correction
- [ ] 1.1 Auto-detect photo boundaries (contour detection on canvas pixel data)
- [ ] 1.2 Render detected rectangle overlay on captured image
- [ ] 1.3 Manual corner-drag UI to adjust crop rectangle
- [ ] 1.4 Perspective transform (4-point homography via canvas `drawImage` with source coords or WebGL)
- [ ] 1.5 Save cropped result back to IndexedDB, update `status: 'reviewed'`
- [ ] **Checkpoint:** captured photo can be auto-cropped with manual override

## Phase 2: Color & Tone Adjustment
- [ ] 2.1 Brightness/contrast sliders (canvas pixel iteration or CSS filter → re-encode)
- [ ] 2.2 Auto white-balance (gray-world or white-point algorithm)
- [ ] 2.3 Shadows/highlights curve adjustment
- [ ] 2.4 Preview applies filters in real-time (CSS filters on displayed image, full render on save)
- [ ] **Checkpoint:** sliders adjust photo appearance; save persists corrected version

## Phase 3: Restoration Filters
- [ ] 3.1 Grayscale conversion with channel weighting
- [ ] 3.2 Sepia tone
- [ ] 3.3 Scratch/dust removal (median filter or clone-brush tool — stretch goal)
- [ ] 3.4 Compare before/after toggle
- [ ] **Checkpoint:** restoration filters apply and save correctly

## Phase 4: Processing Queue
- [ ] 4.1 Background processing via Web Worker (avoid blocking UI during pixel ops)
- [ ] 4.2 Progress indicator for long operations
- [ ] 4.3 Cancel in-flight processing
- [ ] **Checkpoint:** heavy filters run off-main-thread; UI stays responsive

## Definition of Done
Full pipeline: capture → auto-crop → manual adjust → color correct → restore → save. All pure functions tested with vitest. Canvas mock in tests.
