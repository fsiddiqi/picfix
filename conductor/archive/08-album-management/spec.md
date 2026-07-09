# Spec: Album Management & Metadata

## What & why

Users need to organize digitized photos into albums, rename/delete albums, view photo details, edit metadata (title, caption), move photos between albums, and delete unwanted photos. Without this, captured photos sit in a flat "Unsorted" bucket with no way to organize or clean up.

## In scope

- **Album CRUD:** create, rename, and delete albums via the album list screen
- **Photo detail view:** full-size image viewer with pinch-zoom, status badge, album name, dimensions, capture date
- **Metadata editing:** edit photo title and caption inline in the detail view
- **Status badge:** "Needs Review" / "Reviewed" indicator; tap to launch crop/correct (link to processing pipeline)
- **Move photos:** multi-select photos in the grid, choose target album, batch update `albumId`
- **Delete photos:** delete from detail view or multi-select grid; remove IndexedDB record and blob data
- **Orphan cleanup:** deleting an album moves its photos to "Unsorted"; deleting a photo removes its blob from storage

## Out of scope

- Server-side sync (deferred to future)
- Sub-albums / nested album hierarchy
- AI face recognition or auto-tagging
- Shared albums or public links
- Photo reordering within an album (see Track 10)

## Acceptance criteria

1. User can create a new album with a name, rename it by double-tapping the name, and delete it with confirmation; deleted album's photos move to "Unsorted".
2. Tapping a photo in the grid opens the detail view showing full-resolution image, status badge, album name, dimensions (if loaded), and capture date.
3. User can edit title and caption by tapping the field, typing, and pressing Enter; changes persist to IndexedDB.
4. User can long-press (or tap select) to enter multi-select mode in the photo grid, then batch-move selected photos to another album.
5. Deleting a photo (from detail view or multi-select) removes the IndexedDB record and its associated blob data — no orphaned storage.
6. All operations have corresponding unit/component tests covering success and edge cases (e.g., deleting the last photo in an album, renaming to empty string).

## Test approach

- Unit tests for storage CRUD via `fake-indexeddb`
- Component tests via `@testing-library/react` with mocked storage module (for album list, photo grid, photo detail)
- Manual E2E verification on Android Chrome for multi-select and delete flows
