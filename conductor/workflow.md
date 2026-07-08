# Workflow

## Development style: TDD, spec-driven
For each task in a track's `plan.md`: write the test first (mapped to a
specific acceptance criterion in `spec.md`), watch it fail, implement,
watch it pass. Do not write implementation before the test it's meant to
satisfy exists.

## Rules
- **Don't edit `spec.md` while implementing** a track. If a spec seems
  wrong or infeasible, stop and flag it with a specific proposed edit —
  don't silently implement something different.
- **Work tracks in order**: `01-scan-capture` → `02-crop-and-correct` →
  `03-album-management`, before touching phase-2 tracks
  (`04-colorize-restore` and beyond). Don't build shared phase-2 infra
  early "for efficiency."
- **Every acceptance criterion in `spec.md` needs an explicit pass/fail**,
  mapped to a specific test. Don't mark a task or phase complete based on
  "should work."
- **Keep `processing/` pure** (see `tech-stack.md`). If a change requires
  `processing/` to import from `storage/` or UI, stop — that's a boundary
  violation, restructure instead.
- At the end of each phase within a track's `plan.md`, do a manual
  verification pass against `spec.md` before moving to the next phase.

## Commit strategy
One commit per completed task in `plan.md`, referencing the task ID in the
commit message. Keeps `revert`-by-task meaningful.
