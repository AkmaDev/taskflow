import "fake-indexeddb/auto";

/**
 * Node >= 24 expose un `localStorage` natif expérimental qui masque celui
 * fourni par jsdom sur `window`, et qui lève une erreur/retourne undefined
 * sans le flag `--localstorage-file`. On le remplace par un Storage minimal
 * en mémoire pour que `window.localStorage` se comporte pareil sur toutes
 * les versions de Node.
 */
class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage?.setItem !== "function") {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}
