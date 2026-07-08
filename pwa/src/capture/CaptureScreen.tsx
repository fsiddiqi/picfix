import { useState, useRef, useCallback, useEffect } from 'react';
import { captureFrame } from './captureFrame';
import { generateThumbnail } from '../processing/thumbnail';
import { ensureUnsortedAlbum, insertPhoto } from '../storage';

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    textAlign: 'center',
  },
  video: {
    width: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
    flex: 1,
  },
  grantButton: {
    padding: '14px 32px',
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#fff',
    backgroundColor: '#007AFF',
  },
  captureButton: {
    position: 'absolute' as const,
    bottom: 64,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 80,
    height: 80,
    borderRadius: 40,
    border: '4px solid #ccc',
    backgroundColor: '#fff',
    fontSize: 14,
    fontWeight: 700,
    color: '#333',
    cursor: 'pointer',
  },
  captureContainer: {
    height: '100%',
    position: 'relative' as const,
  },
};

export default function CaptureScreen({ onNavigate }: {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
} = {}) {
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturing, setCapturing] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setPermission('granted');
    } catch {
      setPermission('denied');
    }
  }, []);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || capturing) return;
    setCapturing(true);
    try {
      const blob = await captureFrame(videoRef.current);
      const [albumId, thumbnailBlob] = await Promise.all([
        ensureUnsortedAlbum(),
        generateThumbnail(blob, 200),
      ]);
      await insertPhoto({ albumId, blob, thumbnailBlob, status: 'needs_review' });
    } finally {
      setCapturing(false);
    }
  }, [capturing]);

  useEffect(() => {
    if (permission === 'prompt') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (permission === 'prompt') {
    return (
      <div style={styles.container}>
        <div style={styles.centered}>
          <p>Requesting camera permission…</p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div style={styles.container}>
        <div style={styles.centered}>
          <p>Camera permission is required to scan photos.</p>
          <p>Please enable it in your browser settings.</p>
          <button style={styles.grantButton} onClick={requestPermission}>
            Grant Permission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.captureContainer}>
      <video ref={videoRef} autoPlay playsInline style={styles.video} data-testid="camera-preview" />
      <button
        style={styles.captureButton}
        onClick={handleCapture}
        disabled={capturing}
      >
        {capturing ? '…' : 'Capture'}
      </button>
      <button
        onClick={() => onNavigate?.('albums')}
        style={{
          position: 'absolute' as const,
          top: 16,
          right: 16,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Albums
      </button>
    </div>
  );
}
