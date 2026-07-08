import { useState, useEffect } from 'react';
import { db, type Album } from '../storage';

const THUMB_SIZE = 80;

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  header: {
    padding: '16px 16px 8px',
    fontSize: 24,
    fontWeight: 700,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px',
  },
  albumCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid #333',
    cursor: 'pointer',
  },
  cover: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    objectFit: 'cover' as const,
    backgroundColor: '#333',
  },
  noCover: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 600,
  },
  photoCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  captureBtn: {
    position: 'absolute' as const,
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    border: 'none',
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 28,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
};

interface AlbumRow {
  album: Album;
  count: number;
  coverUrl: string | null;
}

export default function AlbumList({ onNavigate }: {
  onNavigate: (screen: string, params?: Record<string, unknown>) => void;
}) {
  const [rows, setRows] = useState<AlbumRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const albums = await db.albums.toArray();
      const data = await Promise.all(
        albums.map(async (album) => {
          const photos = await db.photos
            .where('albumId').equals(album.id!)
            .toArray();
          const coverUrl = photos[0]?.thumbnailBlob
            ? URL.createObjectURL(photos[0].thumbnailBlob)
            : null;
          return { album, count: photos.length, coverUrl };
        }),
      );
      if (!cancelled) setRows(data);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>Albums</div>
      <div style={styles.list}>
        {rows.map((r) => (
          <div
            key={r.album.id}
            style={styles.albumCard}
            onClick={() => onNavigate('photos', { albumId: r.album.id, albumName: r.album.name })}
          >
            {r.coverUrl
              ? <img src={r.coverUrl} alt="" style={styles.cover} />
              : <div style={styles.noCover}>📷</div>
            }
            <div style={styles.albumInfo}>
              <div style={styles.albumName}>{r.album.name}</div>
              <div style={styles.photoCount}>{r.count} photo{r.count !== 1 ? 's' : ''}</div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
            No albums yet
          </div>
        )}
      </div>
      <button
        style={styles.captureBtn}
        onClick={() => onNavigate('capture')}
        aria-label="Capture"
      >
        +
      </button>
    </div>
  );
}
