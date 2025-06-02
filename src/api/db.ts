export const openDb = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
        const request = indexedDB.open('NsPixelFlow', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('projects')) {
                db.createObjectStore('projects', {
                    keyPath: 'id',
                    autoIncrement: false,
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

export const execQuery = async (
    storeName: string,
    getRequest: (s: IDBObjectStore) => IDBRequest,
    action: 'readonly' | 'readwrite' = 'readonly'
): Promise<any> => {
    const db = await openDb();
    const transaction = db.transaction(storeName, action);
    const store = transaction.objectStore(storeName);
    const res = await new Promise((resolve, reject) => {
        const req = getRequest(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return res;
};
