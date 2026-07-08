import { loadBlobToImage, getImageDataFromImage, pixelsToBlob } from '../processing/loadImage';

function stubImage() {
  let onloadCb: (() => void) | null = null;
  let onerrorCb: (() => void) | null = null;

  const MockImage = class {
    naturalWidth = 800;
    naturalHeight = 600;

    set onload(fn: () => void) { onloadCb = fn; }
    get onload() { return onloadCb; }

    set onerror(fn: () => void) { onerrorCb = fn; }
    get onerror() { return onerrorCb; }

    set src(_url: string) {
      setTimeout(() => {
        if (onloadCb) onloadCb();
      }, 0);
    }
    get src() { return ''; }
    complete = false;
  };

  vi.stubGlobal('Image', MockImage);
}

function stubImageError() {
  let onerrorCb: (() => void) | null = null;

  const MockImage = class {
    naturalWidth = 0;
    naturalHeight = 0;

    set onerror(fn: () => void) { onerrorCb = fn; }
    get onerror() { return onerrorCb; }

    set src(_url: string) {
      setTimeout(() => {
        if (onerrorCb) onerrorCb();
      }, 0);
    }
    get src() { return ''; }
    complete = false;
  };

  vi.stubGlobal('Image', MockImage);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('loadBlobToImage', () => {
  it('resolves with an image element', async () => {
    stubImage();
    const blob = new Blob(['fake-image'], { type: 'image/jpeg' });
    const img = await loadBlobToImage(blob);
    expect(img).toBeInstanceOf(Image);
    expect(img.naturalWidth).toBe(800);
    expect(img.naturalHeight).toBe(600);
  });

  it('rejects on image load error', async () => {
    stubImageError();
    const blob = new Blob(['invalid'], { type: 'image/jpeg' });
    await expect(loadBlobToImage(blob)).rejects.toThrow('Failed to load image');
  });
});

describe('getImageDataFromImage', () => {
  it('returns ImageData from an image element', () => {
    const fakeData = new Uint8ClampedArray([200, 150, 100, 255]);
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: fakeData, width: 800, height: 600 }),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    const img = new Image();
    Object.defineProperties(img, {
      naturalWidth: { value: 800 },
      naturalHeight: { value: 600 },
    });

    const result = getImageDataFromImage(img);
    expect(result.data).toBe(fakeData);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(ctx.drawImage).toHaveBeenCalledWith(img, 0, 0);
  });

  it('throws if canvas context unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const img = new Image();
    expect(() => getImageDataFromImage(img)).toThrow('Could not get canvas context');
  });
});

describe('pixelsToBlob', () => {
  it('returns a Blob when canvas encodes successfully', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
      (cb as BlobCallback)(new Blob(['encoded'], { type: 'image/jpeg' }));
      return undefined as unknown as boolean;
    });

    const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
    const blob = await pixelsToBlob(pixels, 1, 1);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('rejects if canvas context unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
    await expect(pixelsToBlob(pixels, 1, 1)).rejects.toThrow('Could not get canvas context');
  });

  it('rejects if toBlob returns null', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
      (cb as BlobCallback)(null);
      return undefined as unknown as boolean;
    });

    const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
    await expect(pixelsToBlob(pixels, 1, 1)).rejects.toThrow('Failed to encode image');
  });
});
