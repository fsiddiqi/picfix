import { generateThumbnail } from '../processing/thumbnail';

function stubImage(opts: { shouldFail?: boolean } = {}) {
  const { shouldFail } = opts;
  let onloadCb: (() => void) | null = null;
  let onerrorCb: (() => void) | null = null;

  const MockImage = class {
    width = 800;
    height = 600;

    set onload(fn: () => void) { onloadCb = fn; }
    get onload() { return onloadCb; }

    set onerror(fn: () => void) { onerrorCb = fn; }
    get onerror() { return onerrorCb; }

    set src(_url: string) {
      setTimeout(() => {
        if (shouldFail && onerrorCb) {
          onerrorCb();
        } else if (onloadCb) {
          onloadCb();
        }
      }, 0);
    }
    get src() { return ''; }
  };

  vi.stubGlobal('Image', MockImage);
}

function stubCanvas() {
  const ctx = {
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    this: HTMLCanvasElement,
    cb: BlobCallback
  ) {
    cb(new Blob(['thumb-data'], { type: 'image/jpeg' }));
    return undefined as unknown as boolean;
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('generateThumbnail', () => {
  it('returns a Blob', async () => {
    stubImage();
    stubCanvas();

    const blob = new Blob(['full-size-image'], { type: 'image/jpeg' });
    const thumb = await generateThumbnail(blob, 200);
    expect(thumb).toBeInstanceOf(Blob);
  });

  it('creates a canvas scaled to max dimension', async () => {
    stubImage();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    const toBlobSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      this: HTMLCanvasElement,
      cb: BlobCallback
    ) {
      expect(this.width).toBeLessThanOrEqual(200);
      expect(this.height).toBeLessThanOrEqual(200);
      cb(new Blob(['thumb-data'], { type: 'image/jpeg' }));
      return undefined as unknown as boolean;
    });

    const blob = new Blob(['full-size-image'], { type: 'image/jpeg' });
    await generateThumbnail(blob, 200);
    expect(toBlobSpy).toHaveBeenCalledOnce();
  });

  it('rejects on image load error', async () => {
    stubImage({ shouldFail: true });

    const blob = new Blob(['invalid'], { type: 'image/jpeg' });
    await expect(generateThumbnail(blob, 200)).rejects.toThrow(
      'Failed to load image for thumbnail'
    );
  });
});
