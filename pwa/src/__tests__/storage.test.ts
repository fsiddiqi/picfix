import { db, ensureUnsortedAlbum, insertPhoto, getPhotos, getPhoto, updatePhoto, createAlbum, renameAlbum, deleteAlbum, movePhotosToAlbum, deletePhoto, deletePhotos, getAlbums } from '../storage/database';

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

  describe('getPhoto', () => {
    it('returns a photo by id', async () => {
      const albumId = await ensureUnsortedAlbum();
      const photoId = await insertPhoto({ albumId, blob: new Blob(['a']), status: 'needs_review' });
      const photo = await getPhoto(photoId);
      expect(photo).toBeDefined();
      expect(photo!.id).toBe(photoId);
    });

    it('returns undefined for non-existent id', async () => {
      const photo = await getPhoto(999);
      expect(photo).toBeUndefined();
    });
  });

  describe('updatePhoto', () => {
    it('updates photo fields', async () => {
      const albumId = await ensureUnsortedAlbum();
      const photoId = await insertPhoto({ albumId, blob: new Blob(['a']), status: 'needs_review' });
      await updatePhoto(photoId, { status: 'reviewed', blob: new Blob(['b']) });
      const photo = await getPhoto(photoId);
      expect(photo!.status).toBe('reviewed');
    });
  });

  describe('createAlbum', () => {
    it('creates an album with the given name', async () => {
      const id = await createAlbum('Vacation');
      const album = await db.albums.get(id);
      expect(album).toBeDefined();
      expect(album!.name).toBe('Vacation');
      expect(album!.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('renameAlbum', () => {
    it('updates the album name', async () => {
      const id = await createAlbum('Old Name');
      await renameAlbum(id, 'New Name');
      const album = await db.albums.get(id);
      expect(album!.name).toBe('New Name');
    });
  });

  describe('movePhotosToAlbum', () => {
    it('moves photos to target album', async () => {
      const album1 = await createAlbum('Album 1');
      const album2 = await createAlbum('Album 2');
      const photo1 = await insertPhoto({ albumId: album1, blob: new Blob(['a']), status: 'needs_review' });
      const photo2 = await insertPhoto({ albumId: album1, blob: new Blob(['b']), status: 'needs_review' });

      await movePhotosToAlbum([photo1, photo2], album2);

      const moved1 = await getPhoto(photo1);
      const moved2 = await getPhoto(photo2);
      expect(moved1!.albumId).toBe(album2);
      expect(moved2!.albumId).toBe(album2);
    });
  });

  describe('deletePhoto', () => {
    it('deletes a single photo', async () => {
      const albumId = await ensureUnsortedAlbum();
      const photoId = await insertPhoto({ albumId, blob: new Blob(['a']), status: 'needs_review' });
      await deletePhoto(photoId);
      const photo = await getPhoto(photoId);
      expect(photo).toBeUndefined();
    });
  });

  describe('deletePhotos', () => {
    it('deletes multiple photos', async () => {
      const albumId = await ensureUnsortedAlbum();
      const p1 = await insertPhoto({ albumId, blob: new Blob(['a']), status: 'needs_review' });
      const p2 = await insertPhoto({ albumId, blob: new Blob(['b']), status: 'needs_review' });
      await deletePhotos([p1, p2]);
      expect(await getPhoto(p1)).toBeUndefined();
      expect(await getPhoto(p2)).toBeUndefined();
    });
  });

  describe('getAlbums', () => {
    it('returns all albums', async () => {
      await createAlbum('A');
      await createAlbum('B');
      const all = await getAlbums();
      expect(all.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('deleteAlbum', () => {
    it('deletes the album', async () => {
      const id = await createAlbum('Temp');
      await deleteAlbum(id);
      const album = await db.albums.get(id);
      expect(album).toBeUndefined();
    });

    it('moves photos to Unsorted on delete', async () => {
      const albumId = await createAlbum('To Delete');
      const photoId = await insertPhoto({ albumId, blob: new Blob(['a']), status: 'needs_review' });

      await deleteAlbum(albumId);

      const unsorted = await db.albums.where('name').equals('Unsorted').first();
      expect(unsorted).toBeDefined();
      const photo = await getPhoto(photoId);
      expect(photo!.albumId).toBe(unsorted!.id);
    });
  });
});
