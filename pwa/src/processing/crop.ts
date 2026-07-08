export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export function detectPhotoBounds(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Rect | null {
  const threshold = 30;
  const margin = 4;
  const step = 2;

  const brightness = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
  };

  const avgBrightness = (x1: number, y1: number, x2: number, y2: number) => {
    let sum = 0;
    let count = 0;
    for (let y = y1; y < y2; y += step) {
      for (let x = x1; x < x2; x += step) {
        sum += brightness(x, y);
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  };

  const bg = avgBrightness(0, 0, width, margin);

  let top = -1;
  for (let y = 0; y < height - margin; y += step) {
    const avg = avgBrightness(0, y, width, y + step);
    if (Math.abs(avg - bg) > threshold) {
      top = y;
      break;
    }
  }
  if (top === -1) return null;

  let bottom = -1;
  for (let y = height - margin; y >= 0; y -= step) {
    const avg = avgBrightness(0, y, width, y + step);
    if (Math.abs(avg - bg) > threshold) {
      bottom = y;
      break;
    }
  }
  if (bottom === -1) return null;

  let left = -1;
  for (let x = 0; x < width - margin; x += step) {
    const avg = avgBrightness(x, 0, x + step, height);
    if (Math.abs(avg - bg) > threshold) {
      left = x;
      break;
    }
  }
  if (left === -1) return null;

  let right = -1;
  for (let x = width - margin; x >= 0; x -= step) {
    const avg = avgBrightness(x, 0, x + step, height);
    if (Math.abs(avg - bg) > threshold) {
      right = x;
      break;
    }
  }
  if (right === -1) return null;

  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function cropPixels(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  rect: Rect,
): { pixels: Uint8ClampedArray; width: number; height: number } {
  const { x, y, width, height } = rect;
  const out = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const si = ((y + row) * srcWidth + (x + col)) * 4;
      const di = (row * width + col) * 4;
      out[di] = pixels[si];
      out[di + 1] = pixels[si + 1];
      out[di + 2] = pixels[si + 2];
      out[di + 3] = pixels[si + 3];
    }
  }
  return { pixels: out, width, height };
}

export function perspectiveCorrect(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  corners: [Point, Point, Point, Point],
  dstWidth: number,
  dstHeight: number,
): { pixels: Uint8ClampedArray; width: number; height: number } {
  if (corners.length !== 4) {
    throw new Error('Expected exactly 4 corners');
  }

  const [tl, tr, br, bl] = corners;

  function interpolate(p1: Point, p2: Point, t: number): Point {
    return { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
  }

  const out = new Uint8ClampedArray(dstWidth * dstHeight * 4);

  for (let dy = 0; dy < dstHeight; dy++) {
    const t = dy / (dstHeight - 1 || 1);
    const left = interpolate(tl, bl, t);
    const right = interpolate(tr, br, t);

    for (let dx = 0; dx < dstWidth; dx++) {
      const s = dx / (dstWidth - 1 || 1);
      const src = interpolate(left, right, s);

      const sx = Math.round(src.x);
      const sy = Math.round(src.y);

      if (sx >= 0 && sx < srcWidth && sy >= 0 && sy < srcHeight) {
        const si = (sy * srcWidth + sx) * 4;
        const di = (dy * dstWidth + dx) * 4;
        out[di] = pixels[si];
        out[di + 1] = pixels[si + 1];
        out[di + 2] = pixels[si + 2];
        out[di + 3] = pixels[si + 3];
      }
    }
  }

  return { pixels: out, width: dstWidth, height: dstHeight };
}
