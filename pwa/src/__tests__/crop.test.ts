import { detectPhotoBounds, cropPixels, perspectiveCorrect } from '../processing/crop';

function makeTestPixels(w: number, h: number, fill: [number, number, number] = [10, 10, 10]): Uint8ClampedArray {
  const p = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    p[o] = fill[0];
    p[o + 1] = fill[1];
    p[o + 2] = fill[2];
    p[o + 3] = 255;
  }
  return p;
}

function fillRect(
  pixels: Uint8ClampedArray,
  w: number,
  x: number,
  y: number,
  rw: number,
  rh: number,
  color: [number, number, number],
) {
  for (let row = y; row < y + rh && row < pixels.length / (w * 4); row++) {
    for (let col = x; col < x + rw && col < w; col++) {
      const o = (row * w + col) * 4;
      pixels[o] = color[0];
      pixels[o + 1] = color[1];
      pixels[o + 2] = color[2];
      pixels[o + 3] = 255;
    }
  }
}

describe('detectPhotoBounds', () => {
  it('detects a bright rectangle on a dark background', () => {
    const pixels = makeTestPixels(100, 100, [10, 10, 10]); // dark bg
    fillRect(pixels, 100, 20, 15, 60, 70, [200, 200, 200]); // bright photo

    const result = detectPhotoBounds(pixels, 100, 100);
    expect(result).not.toBeNull();
    expect(result!.x).toBeLessThanOrEqual(25);
    expect(result!.y).toBeLessThanOrEqual(20);
    expect(result!.x + result!.width).toBeGreaterThanOrEqual(75);
    expect(result!.y + result!.height).toBeGreaterThanOrEqual(80);
  });

  it('returns null for uniform image', () => {
    const pixels = makeTestPixels(50, 50, [128, 128, 128]);
    expect(detectPhotoBounds(pixels, 50, 50)).toBeNull();
  });

  it('handles small images within margin limits', () => {
    const w = 32, h = 32;
    const pixels = makeTestPixels(w, h, [0, 0, 0]);
    fillRect(pixels, w, 8, 6, 16, 20, [200, 200, 200]);
    const result = detectPhotoBounds(pixels, w, h);
    expect(result).not.toBeNull();
    expect(result!.x).toBeLessThanOrEqual(10);
    expect(result!.y).toBeLessThanOrEqual(8);
    expect(result!.x + result!.width).toBeGreaterThanOrEqual(22);
    expect(result!.y + result!.height).toBeGreaterThanOrEqual(24);
  });
});

describe('cropPixels', () => {
  it('extracts a sub-region', () => {
    const pixels = makeTestPixels(10, 10, [100, 100, 100]);
    fillRect(pixels, 10, 3, 3, 4, 4, [200, 50, 50]);

    const result = cropPixels(pixels, 10, 10, { x: 3, y: 3, width: 4, height: 4 });
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
    // Center pixel should be the filled color
    const center = (2 * result.width + 2) * 4;
    expect(result.pixels[center]).toBe(200);
    expect(result.pixels[center + 1]).toBe(50);
  });
});

describe('perspectiveCorrect', () => {
  it('maps corners to rectangle', () => {
    const pixels = makeTestPixels(20, 20, [0, 0, 0]);
    // Fill a small square at top-left of the "photo area"
    fillRect(pixels, 20, 2, 2, 4, 4, [255, 0, 0]);

    // Source corners define a slightly skewed rectangle
    const corners = [
      { x: 2, y: 2 },
      { x: 18, y: 3 },
      { x: 17, y: 19 },
      { x: 3, y: 18 },
    ] as const;

    const result = perspectiveCorrect(pixels, 20, 20, corners, 16, 16);
    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
    expect(result.pixels.length).toBe(16 * 16 * 4);
  });

  it('throws for invalid corner count', () => {
    const pixels = makeTestPixels(10, 10);
    expect(() =>
      perspectiveCorrect(pixels, 10, 10, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }] as any, 5, 5),
    ).toThrow('Expected exactly 4 corners');
  });
});
