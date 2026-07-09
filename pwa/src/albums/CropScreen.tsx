import { useState, useEffect, useRef, useCallback } from 'react';
import { getPhoto, updatePhoto, insertPhoto } from '../storage';
import { detectPhotoBounds, perspectiveCorrect } from '../processing/crop';
import { loadBlobToImage, getImageDataFromImage, pixelsToBlob } from '../processing/loadImage';
import { generateThumbnail } from '../processing/thumbnail';
import { processImage, type DetectedRegion, type Point } from '../processing/server';

interface Corner { x: number; y: number }

const HANDLE = 22;
const REGION_COLORS = ['#007AFF', '#FF9500', '#30D158', '#FF3B30', '#AF52DE'];

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#121212',
    color: '#fff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#007AFF',
    fontSize: 16,
    cursor: 'pointer',
  },
  title: { fontSize: 18, fontWeight: 700, flex: 1 },
  imgWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: {
    position: 'relative' as const,
  },
  svg: {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    zIndex: 5,
  },
  handle: {
    position: 'absolute' as const,
    width: HANDLE,
    height: HANDLE,
    borderRadius: '50%',
    border: '3px solid #007AFF',
    background: 'rgba(0,122,255,0.25)',
    cursor: 'grab',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    touchAction: 'none',
  },
  actions: {
    display: 'flex',
    gap: 12,
    padding: '12px 16px',
  },
  btn: {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnPrimary: { background: '#007AFF', color: '#fff' },
  btnSecondary: { background: 'transparent', border: '1px solid #555', color: '#fff' },
  btnWarning: { background: '#FF9500', color: '#fff' },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  loading: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    color: '#999',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #333',
    borderTopColor: '#007AFF',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  tag: {
    position: 'absolute' as const,
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    zIndex: 6,
    whiteSpace: 'nowrap' as const,
    cursor: 'pointer',
    pointerEvents: 'auto' as const,
  },
  tagSelected: {
    background: '#007AFF',
    color: '#fff',
  },
  tagUnselected: {
    background: 'rgba(0,0,0,0.5)',
    color: '#ccc',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  statusRow: {
    padding: '0 16px',
    fontSize: 12,
    color: '#888',
    textAlign: 'center' as const,
  },
};

export default function CropScreen({
  photoId,
  onBack,
}: {
  photoId: number;
  onBack: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [saving, setSaving] = useState(false);
  const [, setTick] = useState(0);

  const [serverMode, setServerMode] = useState<'loading' | 'server' | 'manual' | 'error'>('loading');
  const [serverRegions, setServerRegions] = useState<(DetectedRegion & { selected: boolean })[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const corners = useRef<[Corner, Corner, Corner, Corner]>([
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ]);
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const urlRef = useRef<string | null>(null);
  const imgDataRef = useRef<{ pixels: Uint8ClampedArray; w: number; h: number } | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const photo = await getPhoto(photoId);
        if (!photo || cancel) return;
        const u = URL.createObjectURL(photo.blob);
        urlRef.current = u;
        setUrl(u);
        const img = await loadBlobToImage(photo.blob);
        if (cancel) return;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setNatural({ w, h });
        const id = getImageDataFromImage(img);
        if (cancel) return;
        setPixels(id.data);
        imgDataRef.current = { pixels: id.data, w, h };
      } catch {
        // image load failed
      }
    })();
    return () => {
      cancel = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [photoId]);

  useEffect(() => {
    if (!imgDataRef.current || serverMode !== 'loading') return;
    let cancel = false;
    (async () => {
      const photo = await getPhoto(photoId);
      if (!photo || cancel) return;
      try {
        const result = await processImage(photo.blob);
        if (cancel) return;
        const correctedUrl = URL.createObjectURL(result.correctedBlob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = correctedUrl;
        setUrl(correctedUrl);
        const correctedImg = await loadBlobToImage(result.correctedBlob);
        if (cancel) return;
        const cw = correctedImg.naturalWidth;
        const ch = correctedImg.naturalHeight;
        setNatural({ w: cw, h: ch });
        const correctedData = getImageDataFromImage(correctedImg);
        if (cancel) return;
        setPixels(correctedData.data);
        imgDataRef.current = { pixels: correctedData.data, w: cw, h: ch };
        setServerRegions(result.regions.map(r => ({ ...r, selected: true })));
        setServerMode('server');
      } catch (err) {
        if (cancel) return;
        setServerError(err instanceof Error ? err.message : 'Server unreachable');
        setServerMode('error');
      }
    })();
    return () => { cancel = true; };
  }, [photoId, serverMode]);

  const enterManualMode = useCallback(() => {
    if (!imgDataRef.current) return;
    const { pixels: p, w, h } = imgDataRef.current;
    setNatural({ w, h });
    setPixels(p);
    setServerMode('manual');
    const b = detectPhotoBounds(p, w, h);
    if (b) {
      corners.current = [
        { x: b.x, y: b.y },
        { x: b.x + b.width, y: b.y },
        { x: b.x + b.width, y: b.y + b.height },
        { x: b.x, y: b.y + b.height },
      ];
    } else {
      const m = Math.min(w, h) * 0.08;
      corners.current = [
        { x: m, y: m }, { x: w - m, y: m },
        { x: w - m, y: h - m }, { x: m, y: h - m },
      ];
    }
    setTick(t => t + 1);
  }, []);

  const scale = useCallback(() => {
    if (!natural || !imgRef.current) return 1;
    return imgRef.current.getBoundingClientRect().width / natural.w;
  }, [natural]);

  const handleDown = useCallback((i: number, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      i, sx: e.clientX, sy: e.clientY,
      ox: corners.current[i].x, oy: corners.current[i].y,
    };
  }, []);

  const handleMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !natural) return;
    const s = scale();
    corners.current[d.i] = {
      x: Math.max(0, Math.min(natural.w, d.ox + (e.clientX - d.sx) / s)),
      y: Math.max(0, Math.min(natural.h, d.oy + (e.clientY - d.sy) / s)),
    };
    setTick(t => t + 1);
  }, [natural, scale]);

  const handleUp = useCallback(() => { drag.current = null; }, []);

  const reDetect = useCallback(() => {
    if (!pixels || !natural) return;
    const b = detectPhotoBounds(pixels, natural.w, natural.h);
    if (b) {
      corners.current = [
        { x: b.x, y: b.y }, { x: b.x + b.width, y: b.y },
        { x: b.x + b.width, y: b.y + b.height }, { x: b.x, y: b.y + b.height },
      ];
      setTick(t => t + 1);
    }
  }, [pixels, natural]);

  const toggleRegion = useCallback((index: number) => {
    setServerRegions(prev => prev.map((r, i) => i === index ? { ...r, selected: !r.selected } : r));
  }, []);

  const handleSaveServer = useCallback(async () => {
    if (!imgDataRef.current || !natural || saving) return;
    const selected = serverRegions.filter(r => r.selected);
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const photo = await getPhoto(photoId);
      const albumId = photo?.albumId ?? 1;
      for (const region of selected) {
        const cr: [Point, Point, Point, Point] = [
          region.corners[0], region.corners[1],
          region.corners[3], region.corners[2],
        ];
        const dw = Math.round(Math.max(
          Math.hypot(cr[1].x - cr[0].x, cr[1].y - cr[0].y),
          Math.hypot(cr[3].x - cr[2].x, cr[3].y - cr[2].y),
        ));
        const dh = Math.round(Math.max(
          Math.hypot(cr[3].x - cr[0].x, cr[3].y - cr[0].y),
          Math.hypot(cr[2].x - cr[1].x, cr[2].y - cr[1].y),
        ));
        const img = imgDataRef.current;
        const out = perspectiveCorrect(img.pixels, img.w, img.h, cr, dw, dh);
        const blob = await pixelsToBlob(out.pixels, out.width, out.height);
        const thumb = await generateThumbnail(blob, 200);
        await insertPhoto({ albumId, blob, thumbnailBlob: thumb, status: 'reviewed' });
      }
      onBack();
    } finally {
      setSaving(false);
    }
  }, [serverRegions, saving, photoId, onBack, natural]);

  const handleSaveManual = useCallback(async () => {
    if (!pixels || !natural || saving) return;
    setSaving(true);
    try {
      const cr = corners.current;
      const dw = Math.round(Math.max(
        Math.hypot(cr[1].x - cr[0].x, cr[1].y - cr[0].y),
        Math.hypot(cr[3].x - cr[2].x, cr[3].y - cr[2].y),
      ));
      const dh = Math.round(Math.max(
        Math.hypot(cr[3].x - cr[0].x, cr[3].y - cr[0].y),
        Math.hypot(cr[2].x - cr[1].x, cr[2].y - cr[1].y),
      ));
      const out = perspectiveCorrect(pixels, natural.w, natural.h, cr, dw, dh);
      const blob = await pixelsToBlob(out.pixels, out.width, out.height);
      const thumb = await generateThumbnail(blob, 200);
      await updatePhoto(photoId, { blob, thumbnailBlob: thumb, status: 'reviewed' });
      onBack();
    } finally {
      setSaving(false);
    }
  }, [pixels, natural, saving, photoId, onBack]);

  const s = scale();

  let title: string;
  let body: React.ReactNode;

  if (!url) {
    title = 'Loading…';
    body = <div style={styles.loading}>Loading…</div>;
  } else if (serverMode === 'loading') {
    title = 'Processing';
    body = (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <div>Uploading to processing server…</div>
      </div>
    );
  } else if (serverMode === 'server') {
    const selectedCount = serverRegions.filter(r => r.selected).length;
    title = `${serverRegions.length} region${serverRegions.length !== 1 ? 's' : ''} detected`;
    body = (
      <>
        <div style={styles.imgWrap}>
          {natural && (
            <div style={styles.inner}>
              <img
                ref={imgRef}
                src={url}
                alt=""
                draggable={false}
                style={{ display: 'block', maxWidth: '100%', maxHeight: '80vh' }}
              />
              <svg style={styles.svg} viewBox={`0 0 ${natural.w} ${natural.h}`}>
                {serverRegions.map((r, i) => {
                  if (!r.selected) return null;
                  const pts = r.corners.map(c => `${c.x},${c.y}`).join(' ');
                  return (
                    <polygon
                      key={i}
                      points={pts}
                      fill="rgba(0,122,255,0.08)"
                      stroke={REGION_COLORS[i % REGION_COLORS.length]}
                      strokeWidth={3 / s}
                      strokeDasharray={`${6 / s}, ${4 / s}`}
                    />
                  );
                })}
              </svg>
              {serverRegions.map((r, i) => {
                const cx = r.corners.reduce((a, c) => a + c.x, 0) / r.corners.length;
                const cy = r.corners.reduce((a, c) => a + c.y, 0) / r.corners.length;
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.tag,
                      left: (cx / natural.w) * 100 + '%',
                      top: (cy / natural.h) * 100 + '%',
                      transform: 'translate(-50%, -50%)',
                      ...(r.selected ? styles.tagSelected : styles.tagUnselected),
                    }}
                    onClick={() => toggleRegion(i)}
                  >
                    {r.selected ? `✓ Region ${i + 1}` : `Region ${i + 1}`}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={styles.statusRow}>
          {selectedCount > 0
            ? `${selectedCount} region${selectedCount !== 1 ? 's' : ''} selected`
            : 'Tap a region to select it'}
        </div>
        <div style={styles.actions}>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={enterManualMode}>
            Manual Crop
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary, ...(selectedCount === 0 || saving ? styles.disabled : {}) }}
            onClick={handleSaveServer}
            disabled={selectedCount === 0 || saving}
          >
            {saving ? 'Saving…' : `Save ${selectedCount} Photo${selectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </>
    );
  } else {
    title = 'Crop';
    body = (
      <>
        {serverMode === 'error' && (
          <div style={styles.statusRow}>
            Server: {serverError} — using client-side detection
          </div>
        )}
        <div style={styles.imgWrap}>
          {natural && (
            <div style={styles.inner}>
              <img
                ref={imgRef}
                src={url}
                alt=""
                draggable={false}
                style={{ display: 'block', maxWidth: '100%', maxHeight: '80vh' }}
              />
              <svg style={styles.svg} viewBox={`0 0 ${natural.w} ${natural.h}`}>
                <polygon
                  points={corners.current.map(c => `${c.x},${c.y}`).join(' ')}
                  fill="rgba(0,122,255,0.08)"
                  stroke="#007AFF"
                  strokeWidth={2 / s}
                  strokeDasharray={`${6 / s}, ${4 / s}`}
                />
              </svg>
              {(['tl', 'tr', 'br', 'bl'] as const).map((_, i) => {
                const c = corners.current[i];
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.handle,
                      left: (c.x / natural.w) * 100 + '%',
                      top: (c.y / natural.h) * 100 + '%',
                    }}
                    onPointerDown={(e) => handleDown(i, e)}
                    onPointerMove={handleMove}
                    onPointerUp={handleUp}
                  />
                );
              })}
            </div>
          )}
        </div>
        <div style={styles.actions}>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={reDetect}>
            Auto-detect
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary, ...(saving ? styles.disabled : {}) }}
            onClick={handleSaveManual}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Crop'}
          </button>
        </div>
      </>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <div style={styles.title}>{title}</div>
      </div>
      {body}
    </div>
  );
}
