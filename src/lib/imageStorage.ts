/**
 * IndexedDB storage for images to avoid localStorage quota limits
 * Images are too large to store in localStorage (5-10MB limit)
 * IndexedDB provides much higher quota (typically 50MB+)
 */

const DB_NAME = 'portfoliocad-db';
const STORE_NAME = 'images';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available in non-browser environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

export interface ImageData {
  id: string;
  data: string; // Base64 data URL
  name: string;
  timestamp: number;
}

/**
 * Save an image to IndexedDB
 */
export async function saveImage(id: string, dataUrl: string, name: string = 'image'): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const imageData: ImageData = {
    id,
    data: dataUrl,
    name,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(imageData, id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Load an image from IndexedDB
 */
export async function getImage(id: string): Promise<ImageData | null> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Delete an image from IndexedDB
 */
export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get the data URL for an image ID
 * Returns null if image doesn't exist
 */
export async function getImageDataUrl(id: string): Promise<string | null> {
  const image = await getImage(id);
  return image?.data || null;
}
