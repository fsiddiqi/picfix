# Spec: Album UX Enhancements

## What & why

Photomyne users expect cover photos, search, and per-photo metadata (people, location) for organization. Without these, the album list shows generic placeholders, finding specific photos requires scrolling, and there's no way to record who's in a photo or where it was taken.

## In scope

- **Cover photo:** user can set any photo in an album as the cover; the album list shows the selected cover instead of the first photo or a generic placeholder
- **People tagging:** free-text "People" field on each photo (comma-separated names), editable from the photo detail view
- **Location tagging:** free-text "Location" field on each photo, editable from the photo detail view
- **Album search:** filter album list by typing an album name (real-time, client-side)
- **Photo search:** filter photos in a grid by title, caption, people, or location keywords
- **Album reordering:** drag-to-reorder albums; order persists across sessions

## Out of scope

- AI face detection / recognition (tagging is manual free-text)
- Multi-user shared albums
- Public sharing URLs
- Cloud search (all search is client-side, IndexedDB-based)
- Sub-albums / nested hierarchy
- Audio attachments or back-of-photo scanning

## Acceptance criteria

1. User can long-press a photo in the grid and select "Set as Cover"; the album list immediately shows the chosen photo as the album cover.
2. User can tap the "People" field (empty or filled) in photo detail view, type names, and press Enter; the value persists to IndexedDB and is displayed on revisit.
3. Same as #2 for the "Location" field.
4. Typing in the album search bar filters the album list to show only matching albums; clearing the search restores the full list.
5. Typing in the photo search bar filters the photo grid to show only photos whose title, caption, people, or location contains the query.
6. User can drag an album to a new position in the album list; the order persists after leaving and returning to the screen.
7. All features have unit/component tests.

## Test approach

- Component tests via `@testing-library/react` with mocked storage
- Search tested with known album/photo name sets (verify filtering is correct and performs acceptably with 100+ items)
- Drag-to-reorder tested via simulated drag events or integration tests
- Manual verification on Android Chrome for touch drag-and-drop feel
