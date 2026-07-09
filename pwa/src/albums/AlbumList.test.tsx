import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlbumList from './AlbumList';
import * as storage from '../storage/database';

const { photoStore } = vi.hoisted(() => {
  const store = new Map<number, Array<{ id: number; thumbnailBlob?: Blob }>>();
  return {
    photoStore: store as Map<number, Array<{ id: number; thumbnailBlob?: Blob }>>,
    mockModule: {
      db: {
        albums: {
          toArray: vi.fn<() => Promise<Array<{ id: number; name: string; createdAt: Date }>>>(),
          where: vi.fn(() => ({
            equals: vi.fn(() => ({ first: vi.fn() })),
          })),
          add: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        photos: {
          where: vi.fn(() => ({
            equals: vi.fn((id: number) => ({
              toArray: vi.fn(() => Promise.resolve(store.get(id) ?? [])),
              modify: vi.fn(),
            })),
          })),
        },
      },
      createAlbum: vi.fn(),
      renameAlbum: vi.fn(),
      deleteAlbum: vi.fn(),
      ensureUnsortedAlbum: vi.fn().mockResolvedValue(1),
      insertPhoto: vi.fn(),
      getPhotos: vi.fn(),
      getPhoto: vi.fn(),
      updatePhoto: vi.fn(),
    },
  };
});

vi.mock('../storage/database', () => ({
  db: {
    albums: {
      toArray: vi.fn<() => Promise<Array<{ id: number; name: string; createdAt: Date }>>>(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({ first: vi.fn() })),
      })),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    photos: {
      where: vi.fn(() => ({
        equals: vi.fn((id: number) => ({
          toArray: vi.fn(() => Promise.resolve(photoStore.get(id) ?? [])),
          modify: vi.fn(),
        })),
      })),
    },
  },
  createAlbum: vi.fn(),
  renameAlbum: vi.fn(),
  deleteAlbum: vi.fn(),
  ensureUnsortedAlbum: vi.fn().mockResolvedValue(1),
  insertPhoto: vi.fn(),
  getPhotos: vi.fn(),
  getPhoto: vi.fn(),
  updatePhoto: vi.fn(),
}));

describe('AlbumList', () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnNavigate.mockClear();
    photoStore.clear();
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (storage.db.photos.where as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
        equals: (_id: number) => ({
          toArray: vi.fn(() => Promise.resolve(photoStore.get(_id) ?? [])),
          modify: vi.fn(),
        }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderAlbumList = () => {
    return render(<AlbumList onNavigate={mockOnNavigate} />);
  };

  it('renders "No albums yet" when empty', async () => {
    renderAlbumList();
    await waitFor(() => expect(screen.getByText('No albums yet')).toBeInTheDocument());
  });

  it('renders albums with photo counts', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date('2024-01-01') },
      { id: 2, name: 'Unsorted', createdAt: new Date('2024-01-02') },
    ]);
    photoStore.set(1, [{ id: 10 }, { id: 11 }]);
    photoStore.set(2, []);

    renderAlbumList();
    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(screen.getByText('2 photos')).toBeInTheDocument();
      expect(screen.getByText('Unsorted')).toBeInTheDocument();
      expect(screen.getByText('0 photos')).toBeInTheDocument();
    });
  });

  it('shows "+ New" button and opens inline input on click', async () => {
    renderAlbumList();
    fireEvent.click(screen.getByText('+ New'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Album name')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('creates album on Enter in new album input', async () => {
    (storage.createAlbum as ReturnType<typeof vi.fn>).mockResolvedValue(3);
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ id: 1, name: 'New Album', createdAt: new Date() }]);

    renderAlbumList();
    fireEvent.click(screen.getByText('+ New'));

    const input = screen.getByPlaceholderText('Album name');
    fireEvent.change(input, { target: { value: 'New Album' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(storage.createAlbum).toHaveBeenCalledWith('New Album');
      expect(screen.queryByPlaceholderText('Album name')).not.toBeInTheDocument();
    });
  });

  it('cancels new album input on Escape', async () => {
    renderAlbumList();
    fireEvent.click(screen.getByText('+ New'));

    const input = screen.getByPlaceholderText('Album name');
    fireEvent.change(input, { target: { value: 'New Album' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Album name')).not.toBeInTheDocument();
      expect(storage.createAlbum).not.toHaveBeenCalled();
    });
  });

  it('opens inline edit on double-click album name', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
    ]);

    renderAlbumList();
    await waitFor(() => expect(screen.getByText('Vacation')).toBeInTheDocument());

    fireEvent.dblClick(screen.getByText('Vacation'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Vacation')).toBeInTheDocument();
    });
  });

  it('renames album on Enter in edit input', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ id: 1, name: 'Vacation', createdAt: new Date() }])
      .mockResolvedValue([{ id: 1, name: 'Holiday', createdAt: new Date() }]);

    renderAlbumList();
    await waitFor(() => expect(screen.getByText('Vacation')).toBeInTheDocument());

    fireEvent.dblClick(screen.getByText('Vacation'));
    const input = screen.getByDisplayValue('Vacation');
    fireEvent.change(input, { target: { value: 'Holiday' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(storage.renameAlbum).toHaveBeenCalledWith(1, 'Holiday');
    });
  });

  it('cancels rename on Escape', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
    ]);

    renderAlbumList();
    await waitFor(() => expect(screen.getByText('Vacation')).toBeInTheDocument());

    fireEvent.dblClick(screen.getByText('Vacation'));
    const input = screen.getByDisplayValue('Vacation');
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(storage.renameAlbum).not.toHaveBeenCalled();
    });
  });

  it('cancels rename on blur', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
    ]);

    renderAlbumList();
    await waitFor(() => expect(screen.getByText('Vacation')).toBeInTheDocument());

    fireEvent.dblClick(screen.getByText('Vacation'));
    const input = screen.getByDisplayValue('Vacation');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(storage.renameAlbum).not.toHaveBeenCalled();
    });
  });

  it('shows delete button for non-Unsorted albums', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
      { id: 2, name: 'Unsorted', createdAt: new Date() },
    ]);

    renderAlbumList();
    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      const deleteBtns = screen.getAllByTitle('Delete album');
      expect(deleteBtns).toHaveLength(1);
    });
  });

  it('deletes album after confirmation, moves photos to Unsorted', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        { id: 1, name: 'Vacation', createdAt: new Date() },
        { id: 2, name: 'Unsorted', createdAt: new Date() },
      ])
      .mockResolvedValue([{ id: 2, name: 'Unsorted', createdAt: new Date() }]);

    (storage.deleteAlbum as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    renderAlbumList();
    await waitFor(() => expect(screen.getByText('Vacation')).toBeInTheDocument());

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByTitle('Delete album'));
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Delete "Vacation"? Photos will be moved to Unsorted.');
      expect(storage.deleteAlbum).toHaveBeenCalledWith(1);
    });
  });

  it('cancels delete on confirm cancel', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
    ]);

    renderAlbumList();
    await waitFor(() => expect(screen.getByText('Vacation')).toBeInTheDocument());

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByTitle('Delete album'));

    await waitFor(() => {
      expect(storage.deleteAlbum).not.toHaveBeenCalled();
    });
  });

  it('navigates to photos grid on album cover click', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
    ]);
    photoStore.set(1, [{ id: 10, thumbnailBlob: new Blob() }]);

    renderAlbumList();
    await waitFor(() => expect(screen.getByAltText('')).toBeInTheDocument());

    fireEvent.click(screen.getByAltText(''));
    expect(mockOnNavigate).toHaveBeenCalledWith('photos', { albumId: 1, albumName: 'Vacation' });
  });

  it('navigates to photos grid on album name click', async () => {
    (storage.db.albums.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, name: 'Vacation', createdAt: new Date() },
    ]);

    renderAlbumList();
    await waitFor(() => expect(screen.getByText('Vacation')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Vacation'));
    expect(mockOnNavigate).toHaveBeenCalledWith('photos', { albumId: 1, albumName: 'Vacation' });
  });

  it('navigates to capture on + button click', async () => {
    renderAlbumList();

    fireEvent.click(screen.getByLabelText('Capture'));
    expect(mockOnNavigate).toHaveBeenCalledWith('capture');
  });
});
