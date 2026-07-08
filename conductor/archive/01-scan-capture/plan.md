# Plan: Scan Capture

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Camera capture UI
- [x] Task 1.1: Build capture screen with live preview + capture button
  - [x] 1.1.1 Integrate `expo-camera` (`CameraView`), render preview
  - [x] 1.1.2 Add capture button + shutter feedback (visual busy state)
- [x] Task 1.2: Handle permissions
  - [x] 1.2.1 Request camera permission via `useCameraPermissions()` on screen mount
  - [x] 1.2.2 Denied-state UI with `Linking.openSettings()` deep-link instruction
  - [x] 1.2.3 No-camera-available fallback UI via `onMountError`
- [ ] **Verification checkpoint:** manually confirm capture screen works
  on a real device in all three permission states (granted/denied/no
  camera simulated)

## Phase 2: Persist captured image
- [x] Task 2.1: Write image to app storage
  - [x] 2.1.1 Save JPEG via `expo-file-system` to `Paths.document/photos/`
  - [ ] 2.1.2 Test: capture produces file meeting resolution requirement
- [x] Task 2.2: Create DB row
  - [x] 2.2.1 Ensure "Unsorted" album exists on first launch
  - [x] 2.2.2 `insertPhoto` writes `status = 'needs_review'`, `album_id` = Unsorted
  - [ ] 2.2.3 Test: mocked capture event → correct row + file (AC #1, #5)
- [ ] **Verification checkpoint:** all acceptance criteria in `spec.md`
  pass; test suite green

## Definition of done
All acceptance criteria in `spec.md` map to a passing test or verified
manual check. Status updated in `../../tracks.md`.
