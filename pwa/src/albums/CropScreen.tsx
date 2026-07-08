import { useState, useEffect, useRef, useCallback } from 'react';
import { getPhoto, updatePhoto } from '../storage';
import { detectPhotoBounds, perspectiveCorrect } from '../processing/crop';
import { loadBlobToImage, getImageDataFromImage, pixelsToBlob } from '../processing/loadImage';
import { generateThumbnail } from '../processing/thumbnail';

interface Corner { x: number; y: number }

const HANDLE = 22;

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
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
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

  const corners = useRef<[Corner, Corner, Corner, Corner]>([
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ]);
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const photo = await getPhoto(photoId);
        if (!photo || cancel) return;
        const u = URL.createObjectURL(photo.blob);
        setUrl(u);
        const img = await loadBlobToImage(photo.blob);
        if (cancel) return;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setNatural({ w, h });
        const id = getImageDataFromImage(img);
        if (cancel) return;
        setPixels(id.data);
        const b = detectPhotoBounds(id.data, w, h);
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
      } catch {
        // image load failed — stays in loading state
      }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoId]);

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

  const handleSave = useCallback(async () => {
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
  const cornerLabels = ['tl', 'tr', 'br', 'bl'] as const;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <div style={styles.title}>Crop</div>
      </div>
      <div style={styles.imgWrap}>
        {url && natural && (
          <div style={styles.inner}>
            <img
              ref={imgRef}
              src={url}
              alt=""
              draggable={false}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '80vh' }}
            />
            <svg
              style={styles.svg}
              viewBox={`0 0 ${natural.w} ${natural.h}`}
            >
              <polygon
                points={corners.current.map(c => `${c.x},${c.y}`).join(' ')}
                fill="rgba(0,122,255,0.08)"
                stroke="#007AFF"
                strokeWidth={2 / s}
                strokeDasharray={`${6 / s}, ${4 / s}`}
              />
            </svg>
            {cornerLabels.map((_, i) => {
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
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Crop'}
        </button>
      </div>
    </div>
  );
}
