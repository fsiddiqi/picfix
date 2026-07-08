# Plan: Scan Capture

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Camera capture UI
- [ ] Task 1.1: Build capture screen with live preview + capture button
  - [ ] 1.1.1 Integrate camera library, render preview
  - [ ] 1.1.2 Add capture button + shutter feedback (visual/haptic)
- [ ] Task 1.2: Handle permissions
  - [ ] 1.2.1 Request camera permission on screen mount
  - [ ] 1.2.2 Denied-state UI with settings-deep-link instructions
  - [ ] 1.2.3 No-camera-available fallback UI
- [ ] **Verification checkpoint:** manually confirm capture screen works
  on a real device in all three permission states (granted/denied/no
  camera simulated)

## Phase 2: Persist captured image
- [ ] Task 2.1: Write image to app storage
  - [ ] 2.1.1 Save raw JPEG at ≥2000px long edge to
        `original_capture_path`
  - [ ] 2.1.2 Test: capture produces file meeting resolution requirement
- [ ] Task 2.2: Create DB row
  - [ ] 2.2.1 Ensure "Unsorted" album exists (create on first launch if
        missing)
  - [ ] 2.2.2 Insert `photo` row with `status = 'needs_review'`,
        `album_id` = Unsorted
  - [ ] 2.2.3 Test: mocked capture event → correct row + file (AC #1, #5)
- [ ] **Verification checkpoint:** all acceptance criteria in `spec.md`
  pass; test suite green

## Definition of done
All acceptance criteria in `spec.md` map to a passing test or verified
manual check. Status updated in `../../tracks.md`.
