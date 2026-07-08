# Track 09: Data Portability & Sync

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Export Albums
- [ ] 1.1 "Export Album" → zip full-res images + metadata JSON via JSZip (or manual stream)
- [ ] 1.2 Trigger download via `<a download>` or File System Access API
- [ ] 1.3 Include thumbnail + full-res + EXIF-like metadata in export
- [ ] **Checkpoint:** album exports as downloadable .zip with all photos + metadata

## Phase 2: Import Albums
- [ ] 2.1 File picker for .zip import
- [ ] 2.2 Parse zip: extract images, create album in IndexedDB
- [ ] 2.3 Handle duplicates (skip or prompt) by file hash or filename
- [ ] **Checkpoint:** exported album re-imports identically

## Phase 3: WebDAV / Cloud Sync (Stretch)
- [ ] 3.1 WebDAV client: configurable server URL + credentials
- [ ] 3.2 Sync album to WebDAV folder (PUT each photo)
- [ ] 3.3 Sync status indicator per album
- [ ] 3.4 Credentials stored encrypted via Web Crypto API
- [ ] **Checkpoint:** photos sync to Nextcloud/Owncloud via WebDAV

## Phase 4: Backup & Restore
- [ ] 4.1 Full DB backup as downloadable JSON (metadata only, not blobs)
- [ ] 4.2 Restore DB from JSON backup
- [ ] 4.3 Periodic backup reminder
- [ ] **Checkpoint:** metadata survives full IndexedDB wipe via restore

## Definition of Done
Export/import cycle works end-to-end on Android Chrome. WebDAV sync verified against a test server.
