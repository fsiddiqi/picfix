# Track 08: Album Management & Metadata

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Create / Rename / Delete Albums
- [ ] 1.1 "New Album" button → inline text input → save to IndexedDB
- [ ] 1.2 Rename album (tap name → edit inline)
- [ ] 1.3 Delete album confirmation dialog; move contained photos to "Unsorted"
- [ ] 1.4 Tests for CRUD operations
- [ ] **Checkpoint:** full album CRUD works, no orphaned photos on delete

## Phase 2: Photo Detail View
- [ ] 2.1 Full-size photo viewer (pinch-zoom via CSS transform)
- [ ] 2.2 Metadata display: captured date, album, dimensions, status badge
- [ ] 2.3 Edit title, caption in-place
- [ ] 2.4 "Needs Review" badge → tap to launch crop/correct (link to Track 07)
- [ ] **Checkpoint:** tap photo → see full-res + metadata; edits persist

## Phase 3: Move Photos Between Albums
- [ ] 3.1 Multi-select mode in photo grid (long-press or tap select)
- [ ] 3.2 "Move to Album" sheet with album picker
- [ ] 3.3 Batch move updates `albumId` for all selected photos
- [ ] 3.4 Tests: move affects correct rows, no data loss
- [ ] **Checkpoint:** batch move works; photos appear in target album

## Phase 4: Delete Photos
- [ ] 4.1 Delete from detail view with confirmation
- [ ] 4.2 Delete from multi-select in grid
- [ ] 4.3 Orphan Blob cleanup (no stale blobs in IndexedDB after delete)
- [ ] 4.4 Tests: delete removes DB row and blob data
- [ ] **Checkpoint:** delete removes all traces; no orphaned data

## Definition of Done
All album CRUD, photo detail, move, delete tested and working. No orphaned IndexedDB records.
