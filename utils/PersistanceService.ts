export abstract class PersistanceService<T> {
    abstract setItem(key: string, value: T): Promise<void>;
    abstract getItem(key: string): Promise<T>;
    abstract removeItem(key: string): Promise<void>;
}

export class LocalStorageService<T> extends PersistanceService<T> {
    async setItem(key: string, value: any): Promise<void> {
        localStorage.setItem(key, JSON.stringify(value));
    }

    async getItem(key: string): Promise<T> {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(key);
    }
}

const DBName = 'telefeed'
const dbVersion = 2;

export class IndexedDbService<T> implements PersistanceService<T> {
    private db!: IDBDatabase;
    private dbName!: string;
    private initPromise: Promise<void>;

    constructor(dbName: string) {
        this.dbName = dbName;
        this.initPromise = this.init();
    }

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.dbName, dbVersion);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                // @ts-ignore
                this.db = this.db || request.result || event.target!.result;
                this.db.createObjectStore(DBName, { keyPath: 'key' });
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async setItem(key: string, value: T): Promise<void> {
        await this.initPromise;
        const tx = this.db.transaction(DBName, 'readwrite');
        const store = tx.objectStore(DBName);
        store.put({ key, value: this.serialize(value) });

        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    }

    async getItem(key: string): Promise<T> {
        await this.initPromise;
        const tx = this.db.transaction(DBName, 'readonly');
        const store = tx.objectStore(DBName);
        const request = store.get(key);
        const result = await new Promise<any>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result?.value ? this.deserialize(request.result.value) : null);
            request.onerror = reject;
        });

        return result;
    }

    async getAll(): Promise<T[]> {
        await this.initPromise;
        const tx = this.db.transaction(DBName, 'readonly');
        const store = tx.objectStore(DBName);
        const request = store.getAll();
        const result = await new Promise<any>((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = reject;
        });

        const deserialized = result.map((item: { value: string; }) => this.deserialize(item.value));

        return deserialized;
    }
    
    async removeItem(key: string): Promise<void> {
        await this.initPromise;
        const tx = this.db.transaction(DBName, 'readwrite');
        const store = tx.objectStore(DBName);
        store.delete(key);
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    }
    
    private serialize(value: T): string {
        return JSON.stringify(value);
    }
    
    private deserialize(value: string): T {
        return JSON.parse(value);
    }
}
