export const PROCESSING_SERVER_URL = 'http://localhost:8000';

export interface Point {
  x: number;
  y: number;
}

export interface DetectedRegion {
  corners: Point[];
  confidence: number;
}

export interface ProcessResult {
  regions: DetectedRegion[];
  correctedBlob: Blob;
}

export async function processImage(blob: Blob): Promise<ProcessResult> {
  const form = new FormData();
  form.append('file', blob, 'photo.jpg');

  const resp = await fetch(`${PROCESSING_SERVER_URL}/process`, {
    method: 'POST',
    body: form,
  });

  if (!resp.ok) {
    throw new Error(`Server error: ${resp.status}`);
  }

  const correctedBlob = await resp.blob();
  const regionsHeader = resp.headers.get('X-Regions');
  const regions: DetectedRegion[] = regionsHeader
    ? JSON.parse(regionsHeader).regions
    : [];

  return { regions, correctedBlob };
}
