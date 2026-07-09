import { useState, useEffect, useRef, useCallback } from 'react';
import { getPhoto, getAlbum, updatePhoto, deletePhoto, type Photo, type Album } from '../storage';

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
    flexShrink: 0,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#007AFF',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 8px',
  },
  title: { fontSize: 18, fontWeight: 700, flex: 1 },
  cropBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #FF9500',
    background: 'transparent',
    color: '#FF9500',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #FF3B30',
    background: 'transparent',
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
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
  imgScroll: {
    flex: 1,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  img: {
    display: 'block',
    maxWidth: '100%',
    transformOrigin: '0 0',
    cursor: 'zoom-in',
    userSelect: 'none',
  },
  meta: {
    padding: '12px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flexShrink: 0,
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 14,
    color: '#ccc',
  },
  editableInput: {
    fontSize: 14,
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid #444',
    background: '#1e1e1e',
    color: '#fff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  badge: {
    display: 'inline-flex',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  badgeNeedsReview: {
    background: '#FF9500',
    color: '#fff',
  },
  badgeReviewed: {
    background: '#30D158',
    color: '#fff',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
  },
};

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PhotoDetail({
  photoId,
  onBack,
  onCrop,
}: {
  photoId: number;
  onBack: () => void;
  onCrop: (photoId: number) => void;
}) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    const p = await getPhoto(photoId);
    if (!p) return;
    setPhoto(p);
    const a = await getAlbum(p.albumId);
    if (a) setAlbum(a);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const u = URL.createObjectURL(p.blob);
    urlRef.current = u;
    setUrl(u);
    const img = new Image();
    img.onload = () => {
      setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = u;
  }, [photoId]);

  useEffect(() => {
    load();
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [load]);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingCaption) captionInputRef.current?.focus();
  }, [editingCaption]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * 1.15, 8));
    } else {
      setZoom(z => Math.max(z / 1.15, 1));
    }
  }, []);

  async function handleSaveTitle() {
    const title = editTitle.trim();
    if (title && photo?.id) {
      await updatePhoto(photo.id, { title });
      setPhoto(prev => prev ? { ...prev, title } : null);
    }
    setEditingTitle(false);
  }

  async function handleDelete() {
    if (!photo?.id) return;
    await deletePhoto(photo.id);
    onBack();
  }

  async function handleSaveCaption() {
    const caption = editCaption.trim();
    if (photo?.id) {
      await updatePhoto(photo.id, { caption: caption || undefined });
      setPhoto(prev => prev ? { ...prev, caption: caption || undefined } : null);
    }
    setEditingCaption(false);
  }

  if (!photo) {
    return <div style={styles.loading}>Loading…</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
        <div style={styles.title}>Photo</div>
        <button style={styles.cropBtn} onClick={() => onCrop(photoId)}>
          {photo.status === 'needs_review' ? 'Crop & Review' : 'Re-crop'}
        </button>
        <button style={styles.deleteBtn} onClick={() => setShowConfirmDelete(true)}>
          Delete
        </button>
      </div>
      <div style={styles.imgScroll} onWheel={handleWheel}>
        {url && (
          <img
            ref={imgRef}
            src={url}
            alt=""
            style={{ ...styles.img, transform: `scale(${zoom})` }}
            draggable={false}
          />
        )}
      </div>
      <div style={styles.meta}>
        <div style={styles.fieldRow}>
          <div style={styles.fieldLabel}>Status</div>
          <div>
            <span
              style={{
                ...styles.badge,
                ...(photo.status === 'needs_review' ? styles.badgeNeedsReview : styles.badgeReviewed),
              }}
            >
              {photo.status === 'needs_review' ? 'Needs Review' : 'Reviewed'}
            </span>
          </div>
        </div>
        {album && (
          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Album</div>
            <div style={styles.fieldValue}>{album.name}</div>
          </div>
        )}
        {dimensions && (
          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Dimensions</div>
            <div style={styles.fieldValue}>{dimensions.w} × {dimensions.h}</div>
          </div>
        )}
        <div style={styles.fieldRow}>
          <div style={styles.fieldLabel}>Captured</div>
          <div style={styles.fieldValue}>{formatDate(photo.capturedAt)}</div>
        </div>
        <div style={styles.fieldRow}>
          <div style={styles.fieldLabel}>Title</div>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              style={styles.editableInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setEditingTitle(false);
              }}
              onBlur={handleSaveTitle}
            />
          ) : (
            <div
              style={styles.fieldValue}
              onClick={() => { setEditTitle(photo.title ?? ''); setEditingTitle(true); }}
            >
              {photo.title || '—'}
            </div>
          )}
        </div>
        <div style={styles.fieldRow}>
          <div style={styles.fieldLabel}>Caption</div>
          {editingCaption ? (
            <input
              ref={captionInputRef}
              style={styles.editableInput}
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCaption();
                if (e.key === 'Escape') setEditingCaption(false);
              }}
              onBlur={handleSaveCaption}
            />
          ) : (
            <div
              style={styles.fieldValue}
              onClick={() => { setEditCaption(photo.caption ?? ''); setEditingCaption(true); }}
            >
              {photo.caption || '—'}
            </div>
          )}
        </div>
      </div>
      {showConfirmDelete && (
        <div style={styles.confirmOverlay} onClick={() => setShowConfirmDelete(false)}>
          <div style={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmTitle}>Delete Photo?</div>
            <div style={styles.confirmText}>This photo will be permanently deleted.</div>
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
