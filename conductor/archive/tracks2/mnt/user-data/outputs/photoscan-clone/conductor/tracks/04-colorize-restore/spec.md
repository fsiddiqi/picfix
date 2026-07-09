# Spec: Colorize & Restore (Phase 2)

Do not start until the phase-2 backend (`tech-stack.md`) is stood up and
all phase-1 tracks are `done`.

## What & why
Add B&W photo colorization and blurry-face sharpening as async,
server-processed enhancements.

## High-level approach
- Client (PWA): "Enhance" button on a photo → uploads image to backend →
  creates `enhancement_job` row → polls/receives push on completion →
  downloads result, offers save-as-new-version (never overwrite original
  without explicit user action).
- Backend: `ImageEnhancer` interface (see `tech-stack.md`) with a concrete
  implementation calling a chosen provider. Keep swappable.

## Acceptance criteria (draft — refine once a provider is chosen)
1. Requesting colorization on a B&W photo returns a colorized result
   within an acceptable latency budget (define target once provider is
   chosen — likely 10–60s).
2. Original image is never mutated in place; result stored as a linked
   derivative.
3. Failed jobs surface a clear error and don't leave the photo stuck in
   "processing" indefinitely (timeout required).
4. Per-enhancement cost is logged/trackable from day one.

## Note
This spec is intentionally underspecified — flesh out concrete acceptance
criteria once a provider/model is selected, rather than building against
vague criteria. Do not begin Phase 2 of the plan until that decision is
made and this spec is updated.
