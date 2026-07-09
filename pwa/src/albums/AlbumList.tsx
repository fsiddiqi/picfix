import { useState, useEffect, useRef } from 'react';
import { db, createAlbum, renameAlbum, deleteAlbum, type Album } from '../storage';

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
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 16px 8px',
  },
  headerTitle: { fontSize: 24, fontWeight: 700, flex: 1 },
  newBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #007AFF',
    background: 'transparent',
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
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
  },
  cover: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    objectFit: 'cover' as const,
    backgroundColor: '#333',
    cursor: 'pointer',
    flexShrink: 0,
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
    cursor: 'pointer',
    flexShrink: 0,
  },
  albumInfo: { flex: 1, minWidth: 0 },
  albumNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 600,
    cursor: 'text',
    padding: '2px 4px',
    borderRadius: 4,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: 600,
    padding: '2px 4px',
    borderRadius: 4,
    border: '1px solid #007AFF',
    background: '#2a2a2a',
    color: '#fff',
    outline: 'none',
    width: '100%',
  },
  photoCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#FF3B30',
    fontSize: 20,
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
  },
  newAlbumInput: {
    display: 'flex',
    gap: 8,
    padding: '12px 0',
    borderBottom: '1px solid #333',
    alignItems: 'center',
  },
  newInputField: {
    flex: 1,
    fontSize: 16,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #007AFF',
    background: '#2a2a2a',
    color: '#fff',
    outline: 'none',
  },
  newInputDone: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#007AFF',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  newInputCancel: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #555',
    background: 'transparent',
    color: '#999',
    fontSize: 14,
    cursor: 'pointer',
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
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const newInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

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
  }, [refreshKey]);

  useEffect(() => {
    if (showNewInput) newInputRef.current?.focus();
  }, [showNewInput]);

  useEffect(() => {
    if (editingId !== null) editInputRef.current?.focus();
  }, [editingId]);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await createAlbum(name);
    setNewName('');
    setShowNewInput(false);
    setRefreshKey(k => k + 1);
  }

  async function handleRename(id: number) {
    const name = editName.trim();
    if (!name) return;
    await renameAlbum(id, name);
    setEditingId(null);
    setEditName('');
    setRefreshKey(k => k + 1);
  }

  async function handleDelete(id: number, name: string) {
    if (name === 'Unsorted') return;
    if (!window.confirm(`Delete "${name}"? Photos will be moved to Unsorted.`)) return;
    await deleteAlbum(id);
    setRefreshKey(k => k + 1);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>Albums</div>
        <button style={styles.newBtn} onClick={() => setShowNewInput(true)}>
          + New
        </button>
      </div>
      <div style={styles.list}>
        {showNewInput && (
          <div style={styles.newAlbumInput}>
            <input
              ref={newInputRef}
              style={styles.newInputField}
              placeholder="Album name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setShowNewInput(false); setNewName(''); }
              }}
            />
            <button style={styles.newInputDone} onClick={handleCreate}>Done</button>
            <button
              style={styles.newInputCancel}
              onClick={() => { setShowNewInput(false); setNewName(''); }}
            >
              Cancel
            </button>
          </div>
        )}
        {rows.map((r) => (
          <div key={r.album.id} style={styles.albumCard}>
            {r.coverUrl
              ? (
                <img
                  src={r.coverUrl}
                  alt=""
                  style={styles.cover}
                  onClick={() => onNavigate('photos', { albumId: r.album.id, albumName: r.album.name })}
                />
              )
              : (
                <div
                  style={styles.noCover}
                  onClick={() => onNavigate('photos', { albumId: r.album.id, albumName: r.album.name })}
                >
                  📷
                </div>
              )}
            <div style={styles.albumInfo}>
              {editingId === r.album.id ? (
                <div style={styles.albumNameRow}>
                  <input
                    ref={editInputRef}
                    style={styles.nameInput}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(r.album.id!);
                      if (e.key === 'Escape') { setEditingId(null); setEditName(''); }
                    }}
                    onBlur={() => { setEditingId(null); setEditName(''); }}
                  />
                </div>
              ) : (
                <div
                  style={styles.albumNameRow}
                  onClick={() => onNavigate('photos', { albumId: r.album.id, albumName: r.album.name })}
                >
                  <div
                    style={styles.albumName}
                    onDoubleClick={() => {
                      setEditingId(r.album.id!);
                      setEditName(r.album.name);
                    }}
                  >
                    {r.album.name}
                  </div>
                </div>
              )}
              <div style={styles.photoCount}>
                {r.count} photo{r.count !== 1 ? 's' : ''}
              </div>
            </div>
            {r.album.name !== 'Unsorted' && (
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(r.album.id!, r.album.name)}
                title="Delete album"
              >
                ✕
              </button>
            )}
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
