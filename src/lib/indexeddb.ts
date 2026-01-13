import { type eventWithTime } from "@rrweb/types";

const DB_NAME = "zhaojing-records";
const STORE_NAME = "recordings";

export interface Recording {
  id: number;
  timestamp: number;
  url: string;
  records: eventWithTime[];
  duration: number;
}

// 初始化 IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
};

// 保存录制记录
export const saveRecording = async (
  recording: Omit<Recording, "id">
): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.add(recording);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

// 获取所有录制记录
export const getAllRecordings = async (): Promise<Recording[]> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 获取单个录制记录
export const getRecording = async (id: number): Promise<Recording | null> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

// 删除录制记录
export const deleteRecording = async (id: number): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.delete(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
