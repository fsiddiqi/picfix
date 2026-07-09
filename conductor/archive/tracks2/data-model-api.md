# Data Model & Internal API Contracts

## Phase 1 (IndexedDB, client-side)

Object stores (conceptual schema — adapt to Dexie/idb syntax as needed):

```
album {
  id: string (uuid, primary key)
  name: string
  created_at: number (unix ms)
  cover_photo_id: string | null
}

photo {
  id: string (uuid, primary key)
  album_id: string            -- indexed, references album.id
  image_blob_key: string      -- key into OPFS or IndexedDB blob store
  original_capture_blob_key: string | null  -- un-cropped source, for re-crop
  taken_date: string | null
  location: string | null
  people: string | null       -- comma-separated free text, MVP only
  note: string | null
  crop_corners: string | null -- JSON: [[x,y],[x,y],[x,y],[x,y]]
  created_at: number
  status: 'ready' | 'needs_review'  -- default 'ready'
}
```

Index `photo` by `album_id` for album-grid queries.

`status = 'needs_review'` is set when auto-detection confidence is low
(see `tracks/02-crop-and-correct/spec.md`), so the album UI can flag it.

## Phase 2 additions (Postgres, when backend is introduced)
- `user` table (auth)
- `photo.cloud_url`, `photo.sync_status`
- `enhancement_job`: `id, photo_id, type, status, result_url, created_at`

Mirror the phase-1 schema field-for-field where possible so migration is
mechanical, not a redesign.

## `processing/` module contracts (phase 1)

Inputs/outputs are in-memory image data, not file paths — there's no
native filesystem in a browser.

```ts
type Point = { x: number; y: number };

type DetectedRegion = {
  corners: [Point, Point, Point, Point];
  confidence: number; // 0-1
};

function detectPhotoRegions(source: ImageBitmap): DetectedRegion[];

function cropAndCorrect(
  source: ImageBitmap,
  corners: [Point, Point, Point, Point]
): Promise<Blob>; // JPEG/PNG output blob

function autoColorCorrect(image: ImageBitmap): Promise<Blob>;
```

Run these inside a Web Worker (see `tech-stack.md`) so `opencv.js`
processing doesn't block the UI thread; the calling code awaits a
message-passed result. Any implementation satisfying these signatures and
a track's acceptance criteria is acceptable — loose on approach, strict on
contract.
