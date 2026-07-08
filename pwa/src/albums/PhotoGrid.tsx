import { useState, useEffect, useCallback, useRef } from 'react';
import { getPhotos, type Photo } from '../storage';

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a1a',
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
    padding: '4px 8px',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
  },
  grid: {
    flex: 1,
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 2,
    padding: 2,
  },
  cell: {
    position: 'relative' as const,
    aspectRatio: '1',
    cursor: 'pointer',
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    backgroundColor: '#333',
  },
  badge: {
    position: 'absolute' as const,
    top: 4,
    left: 4,
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    backgroundColor: '#FF9500',
    color: '#fff',
    lineHeight: 1.3,
  },
  empty: {
    gridColumn: '1 / -1',
    padding: 48,
    textAlign: 'center' as const,
    color: '#666',
  },
};

export default function PhotoGrid({
  albumId,
  albumName,
  onBack,
  onCrop,
  refreshKey = 0,
}: {
  albumId: number;
  albumName: string;
  onBack: () => void;
  onCrop: (photoId: number) => void;
  refreshKey?: number;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urls, setUrls] = useState<Map<number, string>>(new Map());

  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getPhotos(albumId);
      if (cancelled) return;
      setPhotos(data);
      // revoke old urls
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      const map = new Map<number, string>();
      for (const p of data) {
        if (p.id && p.thumbnailBlob) {
          map.set(p.id, URL.createObjectURL(p.thumbnailBlob));
        }
      }
      setUrls(map);
    }
    load();
    return () => {
      cancelled = true;
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [albumId, refreshKey]);

  const handlePhotoClick = useCallback((photo: Photo) => {
    if (photo.id) onCrop(photo.id);
  }, [onCrop]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <div style={styles.title}>{albumName}</div>
      </div>
      <div style={styles.grid}>
        {photos.map((p) => (
          <div key={p.id} style={styles.cell} onClick={() => handlePhotoClick(p)}>
            <img
              src={p.id && urls.has(p.id) ? urls.get(p.id)! : undefined}
              style={styles.thumb}
              alt=""
            />
            {p.status === 'needs_review' && (
              <div style={styles.badge}>NEW</div>
            )}
          </div>
        ))}
        {photos.length === 0 && (
          <div style={styles.empty}>No photos yet</div>
        )}
      </div>
    </div>
  );
}
