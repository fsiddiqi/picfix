# Plan: Crop & Auto-Correct

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Fixture library
- [ ] Task 1.1: Assemble test fixture images
  - [ ] 1.1.1 Single clean photo, high-contrast background
  - [ ] 1.1.2 Four photos in a grid, high-contrast background
  - [ ] 1.1.3 Low-contrast background case
  - [ ] 1.1.4 Blank/no-photo capture
  - [ ] 1.1.5 Rotated/skewed photo
- [ ] **Verification checkpoint:** fixtures reviewed, cover all AC cases
      in `spec.md`

## Phase 2: Detection
- [ ] Task 2.1: Implement `detectPhotoRegions`
  - [ ] 2.1.1 Grayscale + blur + Canny edge detection
  - [ ] 2.1.2 Contour finding + quadrilateral filtering
  - [ ] 2.1.3 Confidence scoring
- [ ] Task 2.2: Tests against fixtures (AC #1–4)
  - [ ] 2.2.1 Single-photo test
  - [ ] 2.2.2 Multi-photo (4-grid) test
  - [ ] 2.2.3 Low-contrast test (confidence/needs_review behavior)
  - [ ] 2.2.4 Blank-input test (zero regions, no crash)
- [ ] **Verification checkpoint:** all Phase 2 acceptance criteria passing

## Phase 3: Crop, correct, and perf
- [ ] Task 3.1: Implement `cropAndCorrect` (perspective transform)
  - [ ] 3.1.1 Corner ordering + homography + warp
  - [ ] 3.1.2 Test: rotated/skewed fixture → rectangular output (AC #5)
  - [ ] 3.1.3 Test: manual-corner override path (AC #6)
- [ ] Task 3.2: Implement `autoColorCorrect`
  - [ ] 3.2.1 Histogram equalization / white balance
- [ ] Task 3.3: Performance
  - [ ] 3.3.1 Benchmark full pipeline on a 12MP fixture image
  - [ ] 3.3.2 Add downscale-for-detection step if needed to hit <3s (AC #7)
- [ ] **Verification checkpoint:** all `spec.md` acceptance criteria pass;
      wire into capture flow from track `01`; confirm end-to-end in
      "Unsorted" album

## Definition of done
All acceptance criteria in `spec.md` map to a passing test. Status
updated in `../../tracks.md`.
