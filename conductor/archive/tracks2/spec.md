# Spec: Scan Capture

## What & why
User points the camera (via browser `getUserMedia`) at 1–4 physical
photos on a flat surface and taps capture, producing one raw image held
in memory for downstream processing (handled by track
`02-crop-and-correct`).

## In scope
- Camera preview screen: `<video>` element streaming from
  `getUserMedia({ video: { facingMode: 'environment' } })`, capture button
  that draws the current frame to a `<canvas>` and exports an `ImageBitmap`
  / `Blob`.
- Request highest available resolution via `MediaTrackConstraints`
  (`width`/`height` ideal constraints).
- Handle camera permission prompts gracefully, including the iOS-specific
  case where permission may be re-prompted unexpectedly in installed PWA
  mode (see `product.md` accepted risk) — don't crash or dead-end the UI
  if a prompt appears mid-flow.
- Newly captured photos land in a temporary "Unsorted" album with
  `status = 'needs_review'`, persisted via the `storage/` module
  (IndexedDB/OPFS).

## Out of scope
- Boundary detection / cropping → `02-crop-and-correct`
- Album assignment UI → `03-album-management`
- Live boundary-detection overlay (nice-to-have, not required for phase 1)

## Acceptance criteria
1. Given camera permission is granted, tapping capture writes an image
   blob to storage and creates a `photo` record with
   `status = 'needs_review'`, `album_id` = the "Unsorted" album's id.
2. Given camera permission is denied, the capture screen shows a message
   explaining how to enable it in browser/site settings — no crash, no
   dead UI.
3. Given `getUserMedia` is unsupported or throws (e.g. no camera, or the
   known iOS standalone-mode failure case), the app falls back to a
   file-input-based capture (`<input type="file" accept="image/*"
   capture="environment">`) rather than dead-ending.
4. Captured image resolution is at least 2000px on the long edge where
   the device/browser supports it; if constraints can't be met, capture
   still succeeds at the best available resolution rather than failing.
5. Given a mocked capture event, the correct storage record and blob are
   created with correct field values (unit/component test).

## Test approach
Mock `getUserMedia` and the canvas capture step in tests (Playwright
supports fake camera streams); verify the storage-write side effect, not
real camera hardware.
