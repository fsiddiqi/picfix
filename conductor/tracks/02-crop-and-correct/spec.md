# Spec: Crop & Auto-Correct

This is the core differentiator feature. Build and test the `processing/`
module in isolation before wiring it into any UI.

## What & why
Given a raw capture (possibly containing multiple photos), detect each
photo's boundary, perspective-correct it to a clean rectangle, and apply
basic color/exposure correction.

## Algorithm approach (guidance, not a strict mandate)
1. Grayscale, blur, Canny edge detection.
2. Find contours; filter to quadrilaterals above a minimum area threshold.
3. Order corners, compute perspective transform, warp to rectangle.
4. Auto color correct (histogram equalization / auto white-balance).
5. Compute a confidence score; low confidence → `status = 'needs_review'`.

## Acceptance criteria
Use a fixture set of test images (see Test approach):

1. **Single clean photo, high-contrast background** → exactly one region,
   confidence ≥ 0.8, cropped output has no visible background border.
2. **Four photos in a grid, high-contrast background** → exactly four
   regions, each cropped independently.
3. **Low-contrast background** → either low-confidence detection (flagged
   `needs_review`) or graceful failure — never a confidently wrong crop.
4. **Blank/no-photo input** → zero regions, no crash; UI lets user retake
   or manually crop.
5. **Rotated/skewed photo** → perspective-corrected to a rectangle, not
   just angle-cropped.
6. **Manual override**: given user-adjusted corners, `cropAndCorrect`
   uses those corners, bypassing detection.
7. Processing time for a single 12MP capture < 3 seconds on target
   hardware (downscale for detection if needed, crop applied to full-res
   source).

## Test approach
- Fixture library: ~15–20 sample images covering the cases above, under
  `test/fixtures/scan-capture/`.
- Assert on `DetectedRegion[]` output (count, corner positions within
  tolerance, confidence thresholds) — not pixel-perfect image diffs.
- Tests run headlessly, no device/simulator needed.

## Definition of done
All acceptance criteria pass against the fixture set, `processing/`
functions match the contracts in `../../data-model-api.md`, and this is
wired into the capture flow (track `01`) so completed captures appear
correctly cropped in "Unsorted".
