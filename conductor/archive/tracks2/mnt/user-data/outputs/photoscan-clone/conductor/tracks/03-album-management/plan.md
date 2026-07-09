# Plan: Album Management

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Album CRUD
- [ ] Task 1.1: Create/rename/delete album storage layer
  - [ ] 1.1.1 Create album
  - [ ] 1.1.2 Rename album
  - [ ] 1.1.3 Delete album → move contained photos to "Unsorted"
  - [ ] 1.1.4 Tests against real IndexedDB instance (AC #1, #2)
- [ ] Task 1.2: Album list + grid UI
  - [ ] 1.2.1 Album list screen
  - [ ] 1.2.2 Album grid (thumbnails), tap-through to photo detail
  - [ ] 1.2.3 `needs_review` badge on flagged photos (AC #4)
- [ ] **Verification checkpoint:** manually create/rename/delete an album,
      confirm photos land in Unsorted on delete

## Phase 2: Metadata editing
- [ ] Task 2.1: Photo detail screen
  - [ ] 2.1.1 Display + edit `taken_date`, `location`, `people`, `note`
  - [ ] 2.1.2 Save persists immediately, no restart required
  - [ ] 2.1.3 Test: edit + save → persisted correctly (AC #3)
- [ ] Task 2.2: Move photo between albums
  - [ ] 2.2.1 Album picker UI on photo detail
  - [ ] 2.2.2 Test: move updates `album_id`

## Phase 3: Manual crop adjustment
- [ ] Task 3.1: Corner-drag UI over original capture
  - [ ] 3.1.1 Render draggable corner handles
  - [ ] 3.1.2 On save, call `cropAndCorrect` with new corners
  - [ ] 3.1.3 Set `status = 'ready'` after successful re-crop
  - [ ] 3.1.4 Test: adjustment flow updates `crop_corners`, image, status
        (AC #5)
- [ ] Task 3.2: Auto-trigger this screen when a `needs_review` photo is
      opened

## Phase 4: Delete photo
- [ ] Task 4.1: Delete with confirmation
  - [ ] 4.1.1 Confirmation dialog
  - [ ] 4.1.2 Remove DB row + image file(s), no orphans
  - [ ] 4.1.3 Test: delete leaves no orphaned files (AC #6)
- [ ] **Verification checkpoint:** all `spec.md` acceptance criteria pass

## Definition of done
All acceptance criteria in `spec.md` map to a passing test. Status
updated in `../../tracks.md`.
