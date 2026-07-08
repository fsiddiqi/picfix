import { db, ensureUnsortedAlbum, insertPhoto, getPhotos } from '../storage/database';

describe('storage', () => {
  beforeEach(async () => {
    await db.albums.clear();
    await db.photos.clear();
  });

  describe('ensureUnsortedAlbum', () => {
    it('creates an Unsorted album on first call', async () => {
      const id = await ensureUnsortedAlbum();
      const album = await db.albums.get(id);
      expect(album).toBeDefined();
      expect(album!.name).toBe('Unsorted');
    });

    it('returns the same album id on subsequent calls', async () => {
      const id1 = await ensureUnsortedAlbum();
      const id2 = await ensureUnsortedAlbum();
      expect(id2).toBe(id1);
    });
  });

  describe('insertPhoto', () => {
    it('inserts a photo with correct default fields', async () => {
      const albumId = await ensureUnsortedAlbum();
      const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
      const photoId = await insertPhoto({ albumId, blob, status: 'needs_review' });
      const photo = await db.photos.get(photoId);
      expect(photo).toBeDefined();
      expect(photo!.albumId).toBe(albumId);
      expect(photo!.status).toBe('needs_review');
      expect(photo!.capturedAt).toBeInstanceOf(Date);
    });


  });

  describe('getPhotos', () => {
    it('returns photos for a given album', async () => {
      const albumId = await ensureUnsortedAlbum();
      await insertPhoto({ albumId, blob: new Blob(['a']), status: 'needs_review' });
      await insertPhoto({ albumId, blob: new Blob(['b']), status: 'needs_review' });
      const photos = await getPhotos(albumId);
      expect(photos).toHaveLength(2);
    });

    it('returns empty array for album with no photos', async () => {
      const albumId = await ensureUnsortedAlbum();
      const photos = await getPhotos(albumId);
      expect(photos).toEqual([]);
    });
  });
});
