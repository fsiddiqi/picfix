# Plan: Colorize & Restore

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

**Blocked:** do not start until all phase-1 tracks are `done` and a
colorization/restoration provider has been chosen.

## Phase 0: Prerequisites (blocking)
- [ ] Task 0.1: Confirm all phase-1 tracks are `done` in `../../tracks.md`
- [ ] Task 0.2: Stand up phase-2 backend (FastAPI + Celery + Redis +
      Postgres + S3) per `../../tech-stack.md`
- [ ] Task 0.3: Choose colorization/restoration provider or model; update
      `spec.md` acceptance criteria with concrete latency/cost targets

## Phase 1: Backend job pipeline
- [ ] Task 1.1: `enhancement_job` table + endpoints (create, poll status)
- [ ] Task 1.2: `ImageEnhancer` interface + one concrete adapter
- [ ] Task 1.3: Timeout handling for stuck jobs (AC #3)
- [ ] Task 1.4: Cost logging per job (AC #4)

## Phase 2: Mobile integration
- [ ] Task 2.1: "Enhance" button + upload flow
- [ ] Task 2.2: Poll/notification for job completion
- [ ] Task 2.3: Save-as-new-version flow (never overwrite original, AC #2)
- [ ] Task 2.4: Error UI for failed jobs

## Definition of done
Not applicable until Phase 0 is complete and `spec.md` acceptance criteria
are finalized with concrete targets.
