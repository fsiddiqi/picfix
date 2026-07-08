# Spec: Scan Capture

## What & why
User points the camera at 1–4 physical photos on a flat surface and taps
capture, producing one raw image saved to the device for downstream
processing (handled by track `02-crop-and-correct`).

## In scope
- Camera preview screen with a capture button.
- On capture, save full-resolution raw image to `original_capture_path`.
- Handle camera permission prompts gracefully.
- Newly captured photos land in a temporary "Unsorted" album with
  `status = 'needs_review'`.

## Out of scope
- Boundary detection / cropping → `02-crop-and-correct`
- Album assignment UI → `03-album-management`
- Live boundary-detection overlay (nice-to-have, not required for phase 1)

## Acceptance criteria
1. Given camera permission is granted, tapping capture writes a JPEG to
   app storage and creates a `photo` row with `status = 'needs_review'`,
   `album_id` = the "Unsorted" album's id.
2. Given camera permission is denied, the capture screen shows a message
   explaining how to enable it in device settings — no crash.
3. Given no camera is available (simulator/edge case), no crash; fallback
   message shown.
4. Captured image resolution is at least 2000px on the long edge.
5. Given a mocked capture event, the correct DB row and file are created
   with correct field values (unit test).

## Test approach
Mock the camera module in tests; verify the storage-write side effect,
not real camera hardware.
