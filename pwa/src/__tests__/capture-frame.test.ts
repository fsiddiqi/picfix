import { captureFrame } from '../capture/captureFrame';

function createMockVideo(width: number, height: number): HTMLVideoElement {
  const video = document.createElement('video');
  Object.defineProperty(video, 'videoWidth', { value: width, configurable: true });
  Object.defineProperty(video, 'videoHeight', { value: height, configurable: true });
  return video;
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
    (cb as (blob: Blob | null) => void)(new Blob(['fake-image-data'], { type: 'image/jpeg' }));
    return undefined as unknown as boolean;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('captureFrame', () => {
  it('returns a Blob when given a video element', async () => {
    const video = createMockVideo(1920, 1080);
    const blob = await captureFrame(video);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('throws if video has no dimensions', async () => {
    const video = createMockVideo(0, 0);
    await expect(captureFrame(video)).rejects.toThrow(/no video dimensions/i);
  });
});
