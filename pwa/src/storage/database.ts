import Dexie, { type EntityTable } from 'dexie';

export interface Album {
  id?: number;
  name: string;
  createdAt: Date;
}

export interface Photo {
  id?: number;
  albumId: number;
  blob: Blob;
  thumbnailBlob?: Blob;
  status: 'needs_review' | 'reviewed';
  capturedAt: Date;
  title?: string;
  caption?: string;
}

export class PicFixDB extends Dexie {
  albums!: EntityTable<Album, 'id'>;
  photos!: EntityTable<Photo, 'id'>;

  constructor() {
    super('PicFix');
    this.version(1).stores({
      albums: '++id, name, createdAt',
      photos: '++id, albumId, status, capturedAt',
    });
  }
}

export const db = new PicFixDB();

const UNSORTED_ALBUM_NAME = 'Unsorted';

export async function ensureUnsortedAlbum(): Promise<number> {
  const existing = await db.albums.where('name').equals(UNSORTED_ALBUM_NAME).first();
  if (existing) return existing.id!;
  const id = await db.albums.add({ name: UNSORTED_ALBUM_NAME, createdAt: new Date() });
  return id as number;
}

export async function insertPhoto(photo: Omit<Photo, 'id' | 'capturedAt'> & { capturedAt?: Date }): Promise<number> {
  const id = await db.photos.add({
    ...photo,
    capturedAt: photo.capturedAt ?? new Date(),
  });
  return id as number;
}

export async function getPhotos(albumId: number): Promise<Photo[]> {
  return db.photos.where('albumId').equals(albumId).toArray();
}
