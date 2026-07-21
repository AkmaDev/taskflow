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
 * Global application state store. Currently in-memory only — persistence via
 * a StorageStrategy (see strategy.ts) will be wired in separately.
 */
export class AppStore {
  private static instance: AppStore | undefined;
  private readonly state: Record<string, unknown> = {};

  private constructor() {}

  static getInstance(): AppStore {
    if (AppStore.instance === undefined) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }

  getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  setState(key: string, value: unknown): void {
    this.state[key] = value;
  }
}
