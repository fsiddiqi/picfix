import { useState, useEffect, useCallback } from 'react';
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
  thumb: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover' as const,
    backgroundColor: '#333',
    cursor: 'pointer',
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
}: {
  albumId: number;
  albumName: string;
  onBack: () => void;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urls, setUrls] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getPhotos(albumId);
      if (cancelled) return;
      setPhotos(data);
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
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  const handlePhotoClick = useCallback((photo: Photo) => {
    const url = photo.blob ? URL.createObjectURL(photo.blob) : null;
    if (url) {
      window.open(url, '_blank');
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <div style={styles.title}>{albumName}</div>
      </div>
      <div style={styles.grid}>
        {photos.map((p) => (
          <img
            key={p.id}
            src={p.id && urls.has(p.id) ? urls.get(p.id)! : undefined}
            style={styles.thumb}
            onClick={() => handlePhotoClick(p)}
            alt=""
          />
        ))}
        {photos.length === 0 && (
          <div style={styles.empty}>No photos yet</div>
        )}
      </div>
    </div>
  );
}
