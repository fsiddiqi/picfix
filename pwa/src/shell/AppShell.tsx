import { useState, useCallback, lazy, Suspense } from 'react';
import TabBar from './TabBar';
import UpdatePrompt from './UpdatePrompt';
import InstallBanner from './InstallBanner';

const CaptureScreen = lazy(() => import('../capture/CaptureScreen'));
const AlbumList = lazy(() => import('../albums/AlbumList'));
const PhotoGrid = lazy(() => import('../albums/PhotoGrid'));
const PhotoDetail = lazy(() => import('../albums/PhotoDetail'));
const CropScreen = lazy(() => import('../albums/CropScreen'));

const styles: Record<string, React.CSSProperties> = {
  shell: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#121212',
  },
  screenArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  page: {
    position: 'absolute' as const,
    inset: 0,
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  },
  pageHidden: {
    opacity: 0,
    transform: 'translateX(8px)',
    pointerEvents: 'none' as const,
  },
  pageVisible: {
    opacity: 1,
    transform: 'translateX(0)',
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    fontSize: 14,
  },
};

type Screen =
  | { name: 'capture' }
  | { name: 'albums' }
  | { name: 'photos'; albumId: number; albumName: string }
  | { name: 'detail'; photoId: number }
  | { name: 'crop'; photoId: number };

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>({ name: 'capture' });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = useCallback((name: string, params?: Record<string, unknown>) => {
    switch (name) {
      case 'capture':
        setScreen({ name: 'capture' });
        break;
      case 'albums':
        setScreen({ name: 'albums' });
        break;
      case 'photos':
        setScreen({
          name: 'photos',
          albumId: params?.albumId as number,
          albumName: params?.albumName as string,
        });
        break;
      case 'detail':
        setScreen({
          name: 'detail',
          photoId: params?.photoId as number,
        });
        break;
      case 'crop':
        setScreen({
          name: 'crop',
          photoId: params?.photoId as number,
        });
        break;
    }
  }, []);

  const handleTab = useCallback((key: string) => {
    handleNavigate(key);
  }, [handleNavigate]);

  const activeTab = screen.name === 'capture' ? 'capture' : 'albums';

  const renderScreen = (s: Screen) => {
    switch (s.name) {
      case 'capture':
        return <CaptureScreen onNavigate={handleNavigate} />;
      case 'albums':
        return <AlbumList onNavigate={handleNavigate} />;
      case 'photos':
        return (
          <PhotoGrid
            albumId={s.albumId}
            albumName={s.albumName}
            onBack={() => setScreen({ name: 'albums' })}
            onShowDetail={(photoId) => setScreen({ name: 'detail', photoId })}
            refreshKey={refreshKey}
          />
        );
      case 'detail':
        return (
          <PhotoDetail
            photoId={s.photoId}
            onBack={() => setScreen({ name: 'albums' })}
            onCrop={(photoId) => setScreen({ name: 'crop', photoId })}
          />
        );
      case 'crop':
        return (
          <CropScreen
            photoId={s.photoId}
            onBack={() => {
              setScreen({ name: 'albums' });
              setRefreshKey(k => k + 1);
            }}
          />
        );
    }
  };

  return (
    <div style={styles.shell}>
      <UpdatePrompt />
      <InstallBanner />
      <div style={styles.screenArea}>
        <div
          style={{
            ...styles.page,
            ...(screen.name === 'capture' ? styles.pageVisible : styles.pageHidden),
          }}
          aria-hidden={screen.name !== 'capture'}
        >
          <Suspense fallback={<div style={styles.loader}>Loading…</div>}>
            {screen.name === 'capture' && renderScreen(screen)}
          </Suspense>
        </div>
        <div
          style={{
            ...styles.page,
            ...(screen.name === 'albums' || screen.name === 'photos' || screen.name === 'detail' || screen.name === 'crop'
              ? styles.pageVisible
              : styles.pageHidden),
          }}
          aria-hidden={screen.name === 'capture'}
        >
          <Suspense fallback={<div style={styles.loader}>Loading…</div>}>
            {(screen.name === 'albums' || screen.name === 'photos' || screen.name === 'detail' || screen.name === 'crop') && renderScreen(screen)}
          </Suspense>
        </div>
      </div>
      <TabBar active={activeTab} onTab={handleTab} />
    </div>
  );
}
