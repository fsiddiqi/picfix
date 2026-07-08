import { useState, useCallback } from 'react';
import CaptureScreen from './capture/CaptureScreen';
import { AlbumList, PhotoGrid } from './albums';

type Screen =
  | { name: 'capture' }
  | { name: 'albums' }
  | { name: 'photos'; albumId: number; albumName: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'capture' });

  const handleNavigate = useCallback((name: string, params?: Record<string, unknown>) => {
    switch (name) {
      case 'capture':
        setScreen({ name: 'capture' });
        break;
      case 'albums':
        setScreen({ name: 'albums' });
        break;
      case 'photos':
        setScreen({ name: 'photos', albumId: params?.albumId as number, albumName: params?.albumName as string });
        break;
    }
  }, []);

  switch (screen.name) {
    case 'capture':
      return <CaptureScreen onNavigate={handleNavigate} />;
    case 'albums':
      return <AlbumList onNavigate={handleNavigate} />;
    case 'photos':
      return <PhotoGrid albumId={screen.albumId} albumName={screen.albumName} onBack={() => setScreen({ name: 'albums' })} />;
  }
}
