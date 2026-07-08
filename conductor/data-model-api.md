# Data Model & Internal API Contracts

## Phase 1 (SQLite, on-device)

```sql
CREATE TABLE album (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  cover_photo_id TEXT
);

CREATE TABLE photo (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL REFERENCES album(id),
  file_path TEXT NOT NULL,
  original_capture_path TEXT,
  taken_date TEXT,
  location TEXT,
  people TEXT,
  note TEXT,
  crop_corners TEXT,             -- JSON: [[x,y],[x,y],[x,y],[x,y]]
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready'  -- 'ready' | 'needs_review'
);

CREATE INDEX idx_photo_album ON photo(album_id);
```

## Phase 2 additions (Postgres)
- `user` table (auth)
- `photo.cloud_url`, `photo.sync_status`
- `enhancement_job`: `id, photo_id, type, status, result_url, created_at`

## `processing/` module contracts (phase 1)

```ts
type DetectedRegion = {
  corners: [Point, Point, Point, Point];
  confidence: number; // 0-1
};
function detectPhotoRegions(sourceImagePath: string): DetectedRegion[];

function cropAndCorrect(
  sourceImagePath: string,
  corners: [Point, Point, Point, Point]
): { outputPath: string };

function autoColorCorrect(imagePath: string): { outputPath: string };
```

Any implementation satisfying these signatures and a track's acceptance
criteria is acceptable — this is intentionally loose on approach, strict
on contract.
