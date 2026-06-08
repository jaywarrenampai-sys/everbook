// ─── IndexedDB wrapper (dependency-free) ────────────────────────────────────
// Local-first project storage. Stores project metadata + layout JSON, and the
// original photo blobs, so a book fully restores after refresh / crash without
// any backend or login.

const DB_NAME = "everbook";
const DB_VERSION = 3;
const STORE_PROJECTS = "projects";
const STORE_PHOTOS = "photos";
const STORE_ORDERS = "orders";
const STORE_PDFS = "pdfs";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const photos = db.createObjectStore(STORE_PHOTOS, { keyPath: "key" });
        photos.createIndex("projectId", "projectId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        db.createObjectStore(STORE_ORDERS, { keyPath: "orderNumber" });
      }
      if (!db.objectStoreNames.contains(STORE_PDFS)) {
        const pdfs = db.createObjectStore(STORE_PDFS, { keyPath: "key" });
        pdfs.createIndex("orderNumber", "orderNumber", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(store: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDB().then((db) => db.transaction(store, mode).objectStore(store));
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const STORES = { PROJECTS: STORE_PROJECTS, PHOTOS: STORE_PHOTOS, ORDERS: STORE_ORDERS, PDFS: STORE_PDFS };

export async function idbPut<T>(store: string, value: T): Promise<void> {
  const os = await tx(store, "readwrite");
  await wrap(os.put(value));
}

export async function idbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  const os = await tx(store, "readonly");
  return wrap<T>(os.get(key) as IDBRequest<T>);
}

export async function idbGetAll<T>(store: string): Promise<T[]> {
  const os = await tx(store, "readonly");
  return wrap<T[]>(os.getAll() as IDBRequest<T[]>);
}

export async function idbDelete(store: string, key: IDBValidKey): Promise<void> {
  const os = await tx(store, "readwrite");
  await wrap(os.delete(key));
}

export async function idbGetAllByIndex<T>(
  store: string,
  index: string,
  value: IDBValidKey
): Promise<T[]> {
  const os = await tx(store, "readonly");
  return wrap<T[]>(os.index(index).getAll(value) as IDBRequest<T[]>);
}

export async function idbExists(store: string, key: IDBValidKey): Promise<boolean> {
  const os = await tx(store, "readonly");
  const k = await wrap(os.getKey(key));
  return k !== undefined;
}
