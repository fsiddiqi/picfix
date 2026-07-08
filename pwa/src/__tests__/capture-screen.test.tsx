import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CaptureScreen from '../capture/CaptureScreen';

const mockCaptureFrame = vi.fn();
vi.mock('../capture/captureFrame', () => ({
  captureFrame: (...args: unknown[]) => mockCaptureFrame(...args),
}));

const mockGenerateThumbnail = vi.fn();
vi.mock('../processing/thumbnail', () => ({
  generateThumbnail: (...args: unknown[]) => mockGenerateThumbnail(...args),
}));

const mockEnsureUnsortedAlbum = vi.fn();
const mockInsertPhoto = vi.fn();
vi.mock('../storage/database', () => ({
  ensureUnsortedAlbum: (...args: unknown[]) => mockEnsureUnsortedAlbum(...args),
  insertPhoto: (...args: unknown[]) => mockInsertPhoto(...args),
}));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
    (cb as (blob: Blob | null) => void)(new Blob(['fake'], { type: 'image/jpeg' }));
    return undefined as unknown as boolean;
  });
});

function mockGetUserMedia(result: MediaStream | null, shouldReject = false) {
  const mock = vi.fn();
  if (shouldReject) {
    mock.mockRejectedValue(new Error('Permission denied'));
  } else if (result) {
    mock.mockResolvedValue(result);
  }
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mock },
    configurable: true,
    writable: true,
  });
  return mock;
}

function makeFakeStream(): MediaStream {
  return { getTracks: () => [] } as unknown as MediaStream;
}

describe('CaptureScreen', () => {
  it('shows loading state initially', () => {
    mockGetUserMedia(makeFakeStream());
    render(<CaptureScreen />);
    expect(screen.getByText(/requesting camera/i)).toBeInTheDocument();
  });

  it('shows permission denied UI when getUserMedia fails', async () => {
    mockGetUserMedia(null, true);
    render(<CaptureScreen />);
    const deniedMessage = await screen.findByText(/camera permission is required/i);
    expect(deniedMessage).toBeInTheDocument();
  });

  it('shows video preview when permission granted', async () => {
    mockGetUserMedia(makeFakeStream());
    render(<CaptureScreen />);
    const video = await screen.findByTestId('camera-preview');
    expect(video).toBeInTheDocument();
    expect(screen.getByText('Capture')).toBeInTheDocument();
  });

  it('renders grant permission button when denied', async () => {
    mockGetUserMedia(null, true);
    render(<CaptureScreen />);
    const button = await screen.findByRole('button', { name: /grant permission/i });
    expect(button).toBeInTheDocument();
  });

  describe('capture flow', () => {
    it('captures a frame and saves photo when Capture is pressed', async () => {
      mockGetUserMedia(makeFakeStream());
      mockCaptureFrame.mockResolvedValue(new Blob(['photo-data'], { type: 'image/jpeg' }));
      mockGenerateThumbnail.mockResolvedValue(new Blob(['thumb-data'], { type: 'image/jpeg' }));
      mockEnsureUnsortedAlbum.mockResolvedValue(1);
      mockInsertPhoto.mockResolvedValue(42);

      render(<CaptureScreen />);
      const video = await screen.findByTestId('camera-preview');
      expect(video).toBeInTheDocument();

      const captureButton = screen.getByText('Capture');
      await userEvent.click(captureButton);

      expect(mockCaptureFrame).toHaveBeenCalledTimes(1);
      expect(mockGenerateThumbnail).toHaveBeenCalledTimes(1);
      expect(mockEnsureUnsortedAlbum).toHaveBeenCalledTimes(1);
      expect(mockInsertPhoto).toHaveBeenCalledTimes(1);
      expect(mockInsertPhoto).toHaveBeenCalledWith(
        expect.objectContaining({
          albumId: 1,
          status: 'needs_review',
          thumbnailBlob: expect.any(Blob),
        }),
      );
    });

    it('shows busy state while capturing', async () => {
      mockGetUserMedia(makeFakeStream());
      let resolveCapture: (blob: Blob) => void;
      mockCaptureFrame.mockReturnValue(new Promise((resolve) => { resolveCapture = resolve; }));
      mockGenerateThumbnail.mockResolvedValue(new Blob(['thumb-data'], { type: 'image/jpeg' }));
      mockEnsureUnsortedAlbum.mockResolvedValue(1);
      mockInsertPhoto.mockResolvedValue(42);

      render(<CaptureScreen />);
      await screen.findByTestId('camera-preview');
      const captureButton = screen.getByText('Capture');
      await userEvent.click(captureButton);

      expect(screen.getByText(/…$/)).toBeInTheDocument();

      resolveCapture!(new Blob(['photo-data'], { type: 'image/jpeg' }));
    });
  });
});
