/**
 * Stratégie de stockage commune : toutes les implémentations exposent la
 * même API asynchrone, que le backend sous-jacent soit synchrone
 * (Map, localStorage) ou nativement asynchrone (IndexedDB).
 */
export interface StorageStrategy {
  /** Récupère la valeur associée à `key`, ou `undefined` si absente. */
  get<T>(key: string): Promise<T | undefined>;
  /** Enregistre `value` sous `key`, en écrasant la valeur précédente. */
  set<T>(key: string, value: T): Promise<void>;
  /** Supprime l'entrée associée à `key`. */
  remove(key: string): Promise<void>;
  /** Supprime toutes les entrées du backend. */
  clear(): Promise<void>;
}

/**
 * Stockage en mémoire vive. Les données sont perdues au rechargement
 * de la page. Utile en développement ou pour les tests.
 */
export class VolatileStorage implements StorageStrategy {
  private readonly data = new Map<string, unknown>();

  get<T>(key: string): Promise<T | undefined> {
    return Promise.resolve(this.data.get(key) as T | undefined);
  }

  set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    this.data.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.data.clear();
    return Promise.resolve();
  }
}

/**
 * Stockage persistant basé sur `window.localStorage`. Les valeurs sont
 * sérialisées en JSON ; l'API synchrone du navigateur est enveloppée
 * dans des Promesses pour respecter le contrat `StorageStrategy`.
 */
export class LocalStorageAdapter implements StorageStrategy {
  private readonly prefix: string;

  constructor(prefix = "taskflow:") {
    this.prefix = prefix;
  }

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): Promise<T | undefined> {
    const raw = window.localStorage.getItem(this.key(key));
    if (raw === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(raw) as T);
  }

  set<T>(key: string, value: T): Promise<void> {
    window.localStorage.setItem(this.key(key), JSON.stringify(value));
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    window.localStorage.removeItem(this.key(key));
    return Promise.resolve();
  }

  clear(): Promise<void> {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const rawKey = window.localStorage.key(i);
      if (rawKey?.startsWith(this.prefix)) {
        keysToRemove.push(rawKey);
      }
    }
    keysToRemove.forEach((rawKey) => window.localStorage.removeItem(rawKey));
    return Promise.resolve();
  }
}

/**
 * Stockage persistant basé sur IndexedDB, adapté aux gros volumes de
 * données. L'API native étant événementielle, chaque opération est
 * promisifiée pour exposer la même interface que les autres stratégies.
 */
export class IndexedDBStorage implements StorageStrategy {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private readonly dbName: string;
  private readonly storeName: string;

  constructor(dbName = "taskflow-db", storeName = "keyvalue") {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T> | undefined,
  ): Promise<T | undefined> {
    const db = await this.openDatabase();
    return new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, mode);
      const store = transaction.objectStore(this.storeName);
      const request = run(store);

      transaction.onerror = () => reject(transaction.error);
      if (!request) {
        transaction.oncomplete = () => resolve(undefined);
        return;
      }
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  get<T>(key: string): Promise<T | undefined> {
    return this.withStore<T>("readonly", (store) => store.get(key));
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.withStore("readwrite", (store) => store.put(value, key));
  }

  async remove(key: string): Promise<void> {
    await this.withStore("readwrite", (store) => store.delete(key));
  }

  async clear(): Promise<void> {
    await this.withStore("readwrite", (store) => store.clear());
  }
}
