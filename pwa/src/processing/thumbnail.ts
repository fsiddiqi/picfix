export function generateThumbnail(blob: Blob, maxDimension: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const { width, height } = img;
      let thumbW: number, thumbH: number;
      if (width > height) {
        thumbW = maxDimension;
        thumbH = Math.round((height / width) * maxDimension);
      } else {
        thumbH = maxDimension;
        thumbW = Math.round((width / height) * maxDimension);
      }

      const canvas = document.createElement('canvas');
      canvas.width = thumbW;
      canvas.height = thumbH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, thumbW, thumbH);
      URL.revokeObjectURL(url);

      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode thumbnail'));
      }, 'image/jpeg', 0.8);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = url;
  });
}
