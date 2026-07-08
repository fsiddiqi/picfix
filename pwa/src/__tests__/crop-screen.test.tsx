import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { db } from '../storage';
import CropScreen from '../albums/CropScreen';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

it('shows loading then crop UI', async () => {
  const albumId = await db.albums.add({ name: 'Test', createdAt: new Date() });
  const photoId = await db.photos.add({
    albumId,
    blob: new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' }),
    status: 'needs_review',
    capturedAt: new Date(),
  });

  const onBack = vi.fn();
  render(<CropScreen photoId={photoId} onBack={onBack} />);

  expect(screen.getByText('Crop')).toBeTruthy();
  expect(screen.getByText('← Back')).toBeTruthy();
  expect(screen.getByText('Auto-detect')).toBeTruthy();
  expect(screen.getByText('Save Crop')).toBeTruthy();
});

it('back button calls onBack', async () => {
  const photoId = await db.photos.add({
    albumId: 1,
    blob: new Blob(),
    status: 'needs_review',
    capturedAt: new Date(),
  });
  const onBack = vi.fn();
  render(<CropScreen photoId={photoId} onBack={onBack} />);

  screen.getByText('← Back').click();
  expect(onBack).toHaveBeenCalledOnce();
});
