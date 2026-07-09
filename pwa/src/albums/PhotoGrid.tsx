import { useState, useEffect, useCallback, useRef } from 'react';
import { getPhotos, getAlbums, movePhotosToAlbum, deletePhotos, type Photo, type Album } from '../storage';

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
    flex: 1,
  },
  selectBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #007AFF',
    background: 'transparent',
    color: '#007AFF',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  selectBtnActive: {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #FF3B30',
    background: '#FF3B30',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
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
  checkmark: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    border: '2px solid #fff',
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
  },
  checkmarkSelected: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    border: '2px solid #007AFF',
    background: '#007AFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
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
  actionBar: {
    display: 'flex',
    gap: 8,
    padding: '8px 16px 16px',
    borderTop: '1px solid #333',
  },
  actionBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionMove: {
    background: '#007AFF',
    color: '#fff',
  },
  actionDelete: {
    background: '#FF3B30',
    color: '#fff',
  },
  actionDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  empty: {
    gridColumn: '1 / -1',
    padding: 48,
    textAlign: 'center' as const,
    color: '#666',
  },
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    width: '100%',
    background: '#1e1e1e',
    borderRadius: '16px 16px 0 0',
    padding: '16px 0 24px',
    maxHeight: '60vh',
    overflowY: 'auto' as const,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 700,
    padding: '0 16px 12px',
    color: '#fff',
  },
  sheetItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    color: '#fff',
    fontSize: 15,
  },
  sheetItemHover: {
    background: '#2a2a2a',
  },
  confirmOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  confirmBox: {
    background: '#1e1e1e',
    borderRadius: 14,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 8,
    color: '#fff',
    textAlign: 'center' as const,
  },
  confirmText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  confirmRow: {
    display: 'flex',
    gap: 8,
  },
  confirmBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function PhotoGrid({
  albumId,
  albumName,
  onBack,
  onShowDetail,
  refreshKey = 0,
}: {
  albumId: number;
  albumName: string;
  onBack: () => void;
  onShowDetail: (photoId: number) => void;
  refreshKey?: number;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urls, setUrls] = useState<Map<number, string>>(new Map());
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getPhotos(albumId);
      if (cancelled) return;
      setPhotos(data);
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
    if (!photo.id) return;
    if (selectMode) {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(photo.id!)) next.delete(photo.id!);
        else next.add(photo.id!);
        return next;
      });
    } else {
      onShowDetail(photo.id);
    }
  }, [selectMode, onShowDetail]);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  const openAlbumPicker = useCallback(async () => {
    const all = await getAlbums();
    setAlbums(all.filter(a => a.id !== albumId));
    setShowAlbumPicker(true);
  }, [albumId]);

  const handleMove = useCallback(async (targetAlbumId: number) => {
    const ids = Array.from(selected);
    await movePhotosToAlbum(ids, targetAlbumId);
    setShowAlbumPicker(false);
    exitSelectMode();
    setPhotos(prev => prev.filter(p => p.id && !selected.has(p.id)));
  }, [selected, exitSelectMode]);

  const handleDelete = useCallback(async () => {
    const ids = Array.from(selected);
    await deletePhotos(ids);
    setShowConfirmDelete(false);
    exitSelectMode();
    setPhotos(prev => prev.filter(p => p.id && !selected.has(p.id)));
  }, [selected, exitSelectMode]);

  const count = selected.size;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={selectMode ? exitSelectMode : onBack}>
          {selectMode ? 'Cancel' : '← Back'}
        </button>
        <div style={styles.title}>
          {selectMode ? `${count} selected` : albumName}
        </div>
        {!selectMode && (
          <button style={styles.selectBtn} onClick={() => setSelectMode(true)}>
            Select
          </button>
        )}
      </div>
      <div style={styles.grid}>
        {photos.map((p) => {
          const isSelected = p.id ? selected.has(p.id) : false;
          return (
            <div key={p.id} style={styles.cell} onClick={() => handlePhotoClick(p)}>
              <img
                src={p.id && urls.has(p.id) ? urls.get(p.id)! : undefined}
                style={styles.thumb}
                alt=""
              />
              {p.status === 'needs_review' && !selectMode && (
                <div style={styles.badge}>NEW</div>
              )}
              {selectMode && (
                <div style={isSelected ? styles.checkmarkSelected : styles.checkmark}>
                  {isSelected ? '✓' : ''}
                </div>
              )}
            </div>
          );
        })}
        {photos.length === 0 && (
          <div style={styles.empty}>No photos yet</div>
        )}
      </div>
      {selectMode && count > 0 && (
        <div style={styles.actionBar}>
          <button
            style={{ ...styles.actionBtn, ...styles.actionMove }}
            onClick={openAlbumPicker}
          >
            Move
          </button>
          <button
            style={{ ...styles.actionBtn, ...styles.actionDelete }}
            onClick={() => setShowConfirmDelete(true)}
          >
            Delete
          </button>
        </div>
      )}

      {showAlbumPicker && (
        <div style={styles.overlay} onClick={() => setShowAlbumPicker(false)}>
          <div style={styles.sheet} onClick={e => e.stopPropagation()}>
            <div style={styles.sheetTitle}>Move to Album</div>
            {albums.map(a => (
              <div
                key={a.id}
                style={styles.sheetItem}
                onClick={() => a.id && handleMove(a.id)}
              >
                {a.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div style={styles.confirmOverlay} onClick={() => setShowConfirmDelete(false)}>
          <div style={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmTitle}>Delete Photos?</div>
            <div style={styles.confirmText}>
              {count} photo{count !== 1 ? 's' : ''} will be permanently deleted.
            </div>
            <div style={styles.confirmRow}>
              <button
                style={{ ...styles.confirmBtn, border: '1px solid #555', background: 'transparent', color: '#999' }}
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.confirmBtn, background: '#FF3B30', color: '#fff' }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
