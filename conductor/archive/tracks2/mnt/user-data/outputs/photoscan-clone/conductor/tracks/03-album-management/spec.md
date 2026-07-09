# Spec: Album Management

## What & why
Organize scanned photos into user-named albums, edit metadata, and
manually fix crops when auto-detection wasn't confident.

## In scope
- Create / rename / delete albums.
- Move photos between albums (including out of "Unsorted").
- Photo detail screen: edit `taken_date`, `location`, `people`, `note`.
- Manual crop adjustment screen: shown automatically when
  `status = 'needs_review'`, reachable manually any time. Dragging corner
  points and saving calls `cropAndCorrect` with new corners and sets
  `status = 'ready'`.
- Album grid view: thumbnail grid, tap to open photo detail.
- Delete photo (with confirmation).

## Acceptance criteria
1. Creating an album with a name persists it and it appears in the album
   list immediately.
2. Deleting an album prompts for confirmation; confirmed deletion moves
   contained photos to "Unsorted" (never silently deletes photos as a side
   effect of album deletion).
3. Editing metadata persists on save, reflected immediately without app
   restart.
4. A `needs_review` photo shows a visible badge in the album grid.
5. Manual crop adjustment updates `crop_corners`, re-runs
   `cropAndCorrect`, updates the stored image, sets `status = 'ready'`.
6. Deleting a photo removes its DB row and image file(s) from disk — no
   orphaned files.

## Test approach
- Storage layer: unit tests against a real IndexedDB instance (via
  `fake-indexeddb` in Node, or a real browser context in Playwright).
- UI: component tests for create-album, edit-metadata, adjust-crop flows
  (React Testing Library). Playwright E2E covering the manual-crop
  drag interaction is recommended given it's the trickiest UI in this
  track; full cross-device E2E beyond that is out of scope for phase 1.
