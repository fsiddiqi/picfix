# Track 10: Album UX Enhancements

Fills the UX gaps identified in the Photomyne comparison: cover photos, search, people/location metadata editing, and album reordering.

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Cover Photo Selection
- [ ] 1.1 Allow user to set album cover from photo grid (long-press or menu)
- [ ] 1.2 Display cover photo in album list (currently shows first photo or placeholder)
- [ ] 1.3 Persist `cover_photo_id` on the `album` record
- [ ] 1.4 Tests: cover set/get/display
- [ ] **Checkpoint:** albums show user-selected cover images

## Phase 2: People & Location Metadata
- [ ] 2.1 Add "People" field to photo detail view (comma-separated, editable)
- [ ] 2.2 Add "Location" field to photo detail view (free text, editable)
- [ ] 2.3 Update `photo` record in IndexedDB on save
- [ ] 2.4 Tests: save and retrieve people/location metadata
- [ ] **Checkpoint:** user can tag people and location per photo

## Phase 3: Search
- [ ] 3.1 Search bar in album list (filter by album name)
- [ ] 3.2 Search bar in photo grid (filter by title, caption, people, location)
- [ ] 3.3 Search results update in real-time as user types
- [ ] 3.4 Tests: search filters correctly
- [ ] **Checkpoint:** user can find albums and photos by name/keyword

## Phase 4: Album Reordering
- [ ] 4.1 Drag-to-reorder albums in album list
- [ ] 4.2 Persist album order (add `sort_order` field or rely on array order)
- [ ] 4.3 Tests: reordering works and persists
- [ ] **Checkpoint:** albums can be reordered by drag-and-drop

## Definition of Done
Cover photos, people/location tagging, full-text search, and album reordering all working and tested.

## Out of scope
- Multi-user/shared albums
- AI face recognition (people tagging is manual free-text)
- Album sharing / public links
