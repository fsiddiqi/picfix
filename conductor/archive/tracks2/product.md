# Product Context

## Vision
A mobile app that lets users photograph physical photos (one or several at
once) and turns them into cropped, corrected, organized digital albums.
(Photomyne-style photo scanner.)

## Target user
Someone digitizing a box/album of family photos. Optimize for speed and
"good enough" quality over precision.

## Platform
**PWA (Progressive Web App)**, not native. Android + desktop are the
priority platforms; iOS is secondary.

**Known accepted risk:** iOS Safari has a documented history of unreliable
camera access in installed/standalone PWA mode (recurring permission
re-prompts, occasional `getUserMedia` failures), and storage is subject to
eviction under device storage pressure even with the Persistent Storage
API requested. Decision: accept this risk for now on iOS, revisit
(possibly a native iOS wrapper) if it proves to be a real problem for
users. Do not spend phase-1 effort iOS-hardening beyond baseline feature
detection and graceful degradation.

## Phase 1 (MVP) — fully offline, client-side
Scope: capture, auto-detect/crop/rotate, basic color correction, album
organization, metadata editing, manual crop override. No backend — all
processing and storage happens in the browser.

Tracks: `01-scan-capture`, `02-crop-and-correct`, `03-album-management`.

## Phase 2 — AI enhancements + backend
Scope: B&W colorization, face sharpening, cloud sync, subscriptions.
Introduces FastAPI + Celery + Redis + Postgres + S3 backend.

Tracks: `04-colorize-restore` (and future sync/subscription tracks, not
yet scoped).

## Non-negotiable quality bars (all phases)
- No crashes on malformed/edge-case input — degrade gracefully.
- A single capture's core processing (detect+crop+correct) completes in
  under 3 seconds on a mid-range 2022+ phone.

## Explicit non-goals (don't build unless a track scopes it)
Slide/negative scanning, sharing/shareable web albums, "bring photo to
life" video effects.
