import { type StorageStrategy, VolatileStorage } from "./strategy.ts";

/** Configuration globale de l'application, partagée sans passage manuel. */
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
 * Store d'état global de l'application. Les lectures sont synchrones via un
 * cache en mémoire ; les écritures sont aussi appliquées à une StorageStrategy
 * en arrière-plan, pour que le backend choisi (volatile, localStorage,
 * IndexedDB) reste synchronisé.
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

  /** Change le backend de persistance utilisé pour les prochaines écritures et lectures. */
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

  /** Lit une valeur depuis le backend courant et alimente le cache en mémoire. */
  async load<T>(key: string): Promise<T | undefined> {
    const value = await this.strategy.get<T>(key);
    if (value !== undefined) {
      this.state[key] = value;
    }
    return value;
  }
}
