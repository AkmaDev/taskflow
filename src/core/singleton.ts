import { type StorageStrategy, VolatileStorage } from "./strategy.ts";

/** Global application configuration, shared across the app without manual passing. */
export class AppConfig {
  private static instance: AppConfig | undefined;
  private readonly config: Record<string, string> = {};

  private constructor() {}

  static getInstance(): AppConfig {
    if (AppConfig.instance === undefined) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  set(key: string, value: string): void {
    this.config[key] = value;
  }

  get(key: string): string | undefined {
    return this.config[key];
  }
}

/**
 * Global application state store. Reads are synchronous against an in-memory
 * cache; writes are also applied to a StorageStrategy in the background so
 * the chosen backend (volatile, localStorage, IndexedDB) stays in sync.
 */
export class AppStore {
  private static instance: AppStore | undefined;
  private readonly state: Record<string, unknown> = {};

  private constructor(private strategy: StorageStrategy) {}

  static getInstance(): AppStore {
    if (AppStore.instance === undefined) {
      AppStore.instance = new AppStore(new VolatileStorage());
    }
    return AppStore.instance;
  }

  /** Swaps the persistence backend used for subsequent writes and reloads. */
  setStrategy(strategy: StorageStrategy): void {
    this.strategy = strategy;
  }

  getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  setState(key: string, value: unknown): void {
    this.state[key] = value;
    void this.strategy.set(key, value);
  }

  /** Reads a value from the current backend and populates the in-memory cache. */
  async load<T>(key: string): Promise<T | undefined> {
    const value = await this.strategy.get<T>(key);
    if (value !== undefined) {
      this.state[key] = value;
    }
    return value;
  }
}
