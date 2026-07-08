# Product Context

## Vision
A mobile app that lets users photograph physical photos (one or several at
once) and turns them into cropped, corrected, organized digital albums.
(Photomyne-style photo scanner.)

## Target user
Someone digitizing a box/album of family photos. Optimize for speed and
"good enough" quality over precision.

## Phase 1 (MVP) — fully offline, on-device
Scope: capture, auto-detect/crop/rotate, basic color correction, album
organization, metadata editing, manual crop override. No backend.

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
