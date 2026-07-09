# Plan: Scan Capture

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Camera capture UI
- [ ] Task 1.1: Build capture screen with live preview + capture button
  - [ ] 1.1.1 `getUserMedia` stream into `<video>`, request rear camera +
        highest resolution constraints
  - [ ] 1.1.2 Capture button: draw video frame to `<canvas>`, export
        `ImageBitmap`/`Blob`
- [ ] Task 1.2: Handle permissions and fallbacks
  - [ ] 1.2.1 Denied-state UI with instructions
  - [ ] 1.2.2 `getUserMedia` unsupported/error → fall back to
        `<input type="file" capture="environment">`
  - [ ] 1.2.3 Note/log iOS standalone-mode re-prompt behavior; ensure UI
        doesn't dead-end if a re-prompt interrupts the flow
- [ ] **Verification checkpoint:** manually confirm capture works in
  Chrome/Android, desktop Chrome, and Safari/iOS (expect iOS quirks per
  accepted risk — document what actually happens, don't block on fixing it)

## Phase 2: Persist captured image
- [ ] Task 2.1: Write image to storage
  - [ ] 2.1.1 Save captured blob at ≥2000px long edge where supported
  - [ ] 2.1.2 Test: capture produces a blob meeting resolution requirement
- [ ] Task 2.2: Create storage record
  - [ ] 2.2.1 Ensure "Unsorted" album exists (create on first launch if
        missing)
  - [ ] 2.2.2 Insert `photo` record with `status = 'needs_review'`,
        `album_id` = Unsorted
  - [ ] 2.2.3 Test: mocked capture event → correct record + blob (AC #1, #5)
- [ ] **Verification checkpoint:** all acceptance criteria in `spec.md`
  pass; test suite green

## Definition of done
All acceptance criteria in `spec.md` map to a passing test or verified
manual check. Status updated in `../../tracks.md`.
