import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhotoGrid from './PhotoGrid';
import * as storage from '../storage/database';

vi.mock('../storage/database', () => {
  const mockAlbums: Array<{ id: number; name: string; createdAt: Date }> = [];

  return {
    db: {
      albums: {
        toArray: vi.fn(),
        where: vi.fn(() => ({
          equals: vi.fn(() => ({ first: vi.fn() })),
        })),
        add: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      photos: {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn(),
            modify: vi.fn(),
          })),
        })),
        add: vi.fn(),
        get: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
    getPhoto: vi.fn(),
    getAlbum: vi.fn(),
    getPhotos: vi.fn(),
    getAlbums: vi.fn().mockImplementation(() => Promise.resolve(mockAlbums)),
    updatePhoto: vi.fn(),
    ensureUnsortedAlbum: vi.fn(),
    insertPhoto: vi.fn(),
    createAlbum: vi.fn(),
    renameAlbum: vi.fn(),
    deleteAlbum: vi.fn(),
    deletePhoto: vi.fn(),
    deletePhotos: vi.fn(),
    movePhotosToAlbum: vi.fn(),
  };
});

const mockPhotos = [
  { id: 1, albumId: 1, blob: new Blob(['a']), thumbnailBlob: new Blob(['a']), status: 'needs_review' as const, capturedAt: new Date() },
  { id: 2, albumId: 1, blob: new Blob(['b']), thumbnailBlob: new Blob(['b']), status: 'reviewed' as const, capturedAt: new Date() },
];

describe('PhotoGrid', () => {
  const onBack = vi.fn();
  const onShowDetail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    onBack.mockClear();
    onShowDetail.mockClear();
    (storage.getPhotos as ReturnType<typeof vi.fn>).mockResolvedValue(mockPhotos);
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders photos with thumbnails', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(screen.getByText('Select')).toBeInTheDocument();
      expect(screen.getByText('NEW')).toBeInTheDocument();
    });
  });

  it('shows empty state when no photos', async () => {
    (storage.getPhotos as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => {
      expect(screen.getByText('No photos yet')).toBeInTheDocument();
    });
  });

  it('enters select mode on Select button click', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => expect(screen.getByText('Select')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Select'));

    await waitFor(() => {
      expect(screen.getByText('0 selected')).toBeInTheDocument();
      expect(screen.queryByText('Select')).not.toBeInTheDocument();
    });
  });

  function clickFirstThumb() {
    const imgs = document.querySelectorAll<HTMLImageElement>('img');
    if (imgs.length > 0) fireEvent.click(imgs[0]);
  }

  it('toggles photo selection on tap in select mode', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => expect(screen.getByText('Select')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Select'));

    await waitFor(() => expect(screen.getByText('0 selected')).toBeInTheDocument());

    clickFirstThumb();

    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    clickFirstThumb();

    await waitFor(() => {
      expect(screen.getByText('0 selected')).toBeInTheDocument();
    });
  });

  it('exits select mode on Cancel', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => expect(screen.getByText('Select')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Select'));

    await waitFor(() => expect(screen.getByText('0 selected')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.getByText('Select')).toBeInTheDocument();
    });
  });

  it('opens album picker on Move, then moves photos', async () => {
    (storage.getAlbums as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
      { id: 2, name: 'Memories', createdAt: new Date() },
    ]);

    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => expect(screen.getByText('Select')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Select'));

    await waitFor(() => expect(screen.getByText('0 selected')).toBeInTheDocument());

    clickFirstThumb();

    await waitFor(() => expect(screen.getByText('1 selected')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Move'));

    await waitFor(() => {
      expect(screen.getByText('Move to Album')).toBeInTheDocument();
      expect(screen.getByText('Memories')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Memories'));

    await waitFor(() => {
      expect(storage.movePhotosToAlbum).toHaveBeenCalledWith([1], 2);
    });
  });

  it('opens delete confirmation on Delete, then deletes', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => expect(screen.getByText('Select')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Select'));

    await waitFor(() => expect(screen.getByText('0 selected')).toBeInTheDocument());

    clickFirstThumb();

    await waitFor(() => expect(screen.getByText('1 selected')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete Photos?')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByText('Delete');
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);

    await waitFor(() => {
      expect(storage.deletePhotos).toHaveBeenCalledWith([1]);
    });
  });

  it('cancels delete on Cancel button', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => expect(screen.getByText('Select')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Select'));

    await waitFor(() => expect(screen.getByText('0 selected')).toBeInTheDocument());

    clickFirstThumb();

    await waitFor(() => expect(screen.getByText('1 selected')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(screen.getByText('Delete Photos?')).toBeInTheDocument());

    const cancels = screen.getAllByText('Cancel');
    fireEvent.click(cancels[cancels.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText('Delete Photos?')).not.toBeInTheDocument();
    });
  });

  it('clicks photo opens detail in normal mode', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
    });

    clickFirstThumb();

    await waitFor(() => {
      expect(onShowDetail).toHaveBeenCalledWith(1);
    });
  });

  it('back button calls onBack in normal mode', async () => {
    render(<PhotoGrid albumId={1} albumName="Vacation" onBack={onBack} onShowDetail={onShowDetail} />);

    await waitFor(() => expect(screen.getByText('← Back')).toBeInTheDocument());
    fireEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
