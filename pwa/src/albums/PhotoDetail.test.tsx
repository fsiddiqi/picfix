import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhotoDetail from './PhotoDetail';
import * as storage from '../storage/database';

const mockPhoto = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  albumId: 1,
  blob: new Blob(['fake'], { type: 'image/jpeg' }),
  thumbnailBlob: new Blob(['thumb'], { type: 'image/jpeg' }),
  status: 'needs_review' as const,
  capturedAt: new Date('2024-06-15T10:30:00'),
  title: undefined,
  caption: undefined,
  ...overrides,
});

vi.mock('../storage/database', () => ({
  db: {
    albums: {
      toArray: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({ first: vi.fn() })),
      })),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
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
  updatePhoto: vi.fn(),
  ensureUnsortedAlbum: vi.fn(),
  insertPhoto: vi.fn(),
  getPhotos: vi.fn(),
  createAlbum: vi.fn(),
  renameAlbum: vi.fn(),
  deleteAlbum: vi.fn(),
  deletePhoto: vi.fn(),
}));

describe('PhotoDetail', () => {
  const onBack = vi.fn();
  const onCrop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    onBack.mockClear();
    onCrop.mockClear();
    (storage.getPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(mockPhoto());
    (storage.getAlbum as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      name: 'Vacation',
      createdAt: new Date(),
    });
    (storage.updatePhoto as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading then photo detail', async () => {
    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);

    await waitFor(() => {
      expect(screen.getByText('Photo')).toBeInTheDocument();
      expect(screen.getByText('← Back')).toBeInTheDocument();
      expect(screen.getByText('Crop & Review')).toBeInTheDocument();
    });

    expect(screen.getByText('Needs Review')).toBeTruthy();
    expect(screen.getByText('Vacation')).toBeTruthy();
    expect(screen.getByText('Jun 15, 2024, 10:30 AM')).toBeTruthy();
  });

  it('back button calls onBack', async () => {
    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);

    await waitFor(() => expect(screen.getByText('← Back')).toBeInTheDocument());
    fireEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('crop button calls onCrop', async () => {
    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);

    await waitFor(() => expect(screen.getByText('Crop & Review')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Crop & Review'));
    expect(onCrop).toHaveBeenCalledWith(1);
  });

  it('shows reviewed status badge for reviewed photos', async () => {
    (storage.getPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPhoto({ status: 'reviewed' }),
    );

    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);
    await waitFor(() => {
      expect(screen.getByText('Reviewed')).toBeTruthy();
      expect(screen.getByText('Re-crop')).toBeTruthy();
    });
  });

  it('shows title if set, allows editing', async () => {
    (storage.getPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPhoto({ title: 'Sunset' }),
    );

    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);
    await waitFor(() => {
      expect(screen.getByText('Sunset')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sunset'));
    const input = screen.getByDisplayValue('Sunset');
    fireEvent.change(input, { target: { value: 'Sunset Beach' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(storage.updatePhoto).toHaveBeenCalledWith(1, { title: 'Sunset Beach' });
    });
  });

  it('shows caption if set, allows editing', async () => {
    (storage.getPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPhoto({ caption: 'Beautiful view' }),
    );

    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);
    await waitFor(() => {
      expect(screen.getByText('Beautiful view')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Beautiful view'));
    const input = screen.getByDisplayValue('Beautiful view');
    fireEvent.change(input, { target: { value: 'Amazing view' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(storage.updatePhoto).toHaveBeenCalledWith(1, { caption: 'Amazing view' });
    });
  });

  it('shows delete confirmation and deletes photo', async () => {
    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);

    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete Photo?')).toBeInTheDocument();
    });

    const buttons = screen.getAllByText('Delete');
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(storage.deletePhoto).toHaveBeenCalledWith(1);
      expect(onBack).toHaveBeenCalledOnce();
    });
  });

  it('cancels delete on Cancel click', async () => {
    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);

    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete Photo?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText('Delete Photo?')).not.toBeInTheDocument();
    });
    expect(storage.deletePhoto).not.toHaveBeenCalled();
  });

  it('cancels title edit on Escape', async () => {
    (storage.getPhoto as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPhoto({ title: 'Original' }),
    );

    render(<PhotoDetail photoId={1} onBack={onBack} onCrop={onCrop} />);
    await waitFor(() => expect(screen.getByText('Original')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Original'));
    const input = screen.getByDisplayValue('Original');
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(storage.updatePhoto).not.toHaveBeenCalled();
    });
  });


});
