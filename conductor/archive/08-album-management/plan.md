# Track 08: Album Management & Metadata

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Create / Rename / Delete Albums ✅
- [x] 1.1 "New Album" button → inline text input → save to IndexedDB
- [x] 1.2 Rename album (tap name → edit inline)
- [x] 1.3 Delete album confirmation dialog; move contained photos to "Unsorted"
- [x] 1.4 Tests for CRUD operations
- [x] **Checkpoint:** full album CRUD works, no orphaned photos on delete

## Phase 2: Photo Detail View ✅
- [x] 2.1 Full-size photo viewer (pinch-zoom via CSS transform)
- [x] 2.2 Metadata display: captured date, album, status badge
- [x] 2.3 Edit title, caption in-place
- [x] 2.4 "Needs Review" badge → tap to launch crop/correct (link to Track 07)
- [x] **Checkpoint:** tap photo → see full-res + metadata; edits persist

## Phase 3: Move Photos Between Albums ✅
- [x] 3.1 Multi-select mode in photo grid (Select button → tap to toggle)
- [x] 3.2 "Move to Album" bottom-sheet with album picker
- [x] 3.3 Batch move updates `albumId` for all selected photos
- [x] 3.4 Tests: move affects correct rows, no data loss
- [x] **Checkpoint:** batch move works; photos appear in target album

## Phase 4: Delete Photos ✅
- [x] 4.1 Delete from detail view with confirmation dialog
- [x] 4.2 Delete from multi-select in grid with confirmation
- [x] 4.3 IndexedDB `db.photos.delete(id)` removes the row (Blob garbage-collected by IndexedDB)
- [x] 4.4 Tests: delete removes DB row; confirmation cancels work
- [x] **Checkpoint:** delete removes all traces; no orphaned data

## Definition of Done
All album CRUD, photo detail, move, delete tested and working. No orphaned IndexedDB records.
