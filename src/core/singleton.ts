import { Observable } from "./observer.ts";
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
  private readonly observables = new Map<string, Observable<unknown>>();

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
    this.getObservable(key).next(value);
  }

  /**
   * Applique une fonction pure à l'état courant de `key` pour produire le
   * suivant — une mise à jour prévisible, sans mutation directe du state.
   */
  dispatch<T>(key: string, action: (current: T | undefined) => T): void {
    this.setState(key, action(this.getState<T>(key)));
  }

  /**
   * Abonne un callback aux changements de `key` ; il est aussi appelé
   * immédiatement avec la valeur courante. Retourne une fonction de
   * désabonnement.
   */
  subscribe<T>(key: string, callback: (value: T | undefined) => void): () => void {
    return this.getObservable(key).subscribe(callback as (value: unknown) => void);
  }

  /** Lit une valeur depuis le backend courant et alimente le cache en mémoire. */
  async load<T>(key: string): Promise<T | undefined> {
    const value = await this.strategy.get<T>(key);
    if (value !== undefined) {
      this.state[key] = value;
      this.getObservable(key).next(value);
    }
    return value;
  }

  private getObservable(key: string): Observable<unknown> {
    let observable = this.observables.get(key);
    if (!observable) {
      observable = new Observable<unknown>(this.state[key]);
      this.observables.set(key, observable);
    }
    return observable;
  }
}
