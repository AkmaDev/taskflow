import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppConfig, AppStore } from "../src/core/singleton.ts";
import { VolatileStorage } from "../src/core/strategy.ts";

describe("AppConfig", () => {
  it("retourne toujours la même instance", () => {
    expect(AppConfig.getInstance()).toBe(AppConfig.getInstance());
  });

  it("stocke et lit une valeur de configuration", () => {
    AppConfig.getInstance().set("appName", "TaskFlow");
    expect(AppConfig.getInstance().get("appName")).toBe("TaskFlow");
  });

  it("retourne undefined pour une clé absente", () => {
    expect(AppConfig.getInstance().get("clé-inconnue-xyz")).toBeUndefined();
  });
});

describe("AppStore", () => {
  beforeEach(() => {
    AppStore.getInstance().setStrategy(new VolatileStorage());
  });

  it("retourne toujours la même instance", () => {
    expect(AppStore.getInstance()).toBe(AppStore.getInstance());
  });

  it("stocke et lit une valeur d'état", () => {
    const store = AppStore.getInstance();
    store.setState("clé-a", 42);
    expect(store.getState<number>("clé-a")).toBe(42);
  });

  it("notifie les abonnés à chaque setState, avec la valeur courante dès l'abonnement", () => {
    const store = AppStore.getInstance();
    store.setState("clé-b", 1);
    const callback = vi.fn();
    store.subscribe<number>("clé-b", callback);
    expect(callback).toHaveBeenLastCalledWith(1);

    store.setState("clé-b", 2);
    expect(callback).toHaveBeenLastCalledWith(2);
  });

  it("applique dispatch comme une fonction pure de l'état courant", () => {
    const store = AppStore.getInstance();
    store.setState("clé-c", 10);
    store.dispatch<number>("clé-c", (current) => (current ?? 0) + 5);
    expect(store.getState<number>("clé-c")).toBe(15);
  });

  it("arrête de notifier un abonné après désabonnement", () => {
    const store = AppStore.getInstance();
    const callback = vi.fn();
    const unsubscribe = store.subscribe<number>("clé-d", callback);
    callback.mockClear();

    unsubscribe();
    store.setState("clé-d", 99);

    expect(callback).not.toHaveBeenCalled();
  });

  it("persiste chaque setState via la stratégie de stockage active", async () => {
    const strategy = new VolatileStorage();
    const store = AppStore.getInstance();
    store.setStrategy(strategy);

    store.setState("clé-e", "valeur");

    await expect(strategy.get("clé-e")).resolves.toBe("valeur");
  });

  it("load() lit depuis la stratégie et met à jour le cache et les abonnés", async () => {
    const strategy = new VolatileStorage();
    await strategy.set("clé-f", "persisté");
    const store = AppStore.getInstance();
    store.setStrategy(strategy);

    const value = await store.load<string>("clé-f");
    const callback = vi.fn();
    store.subscribe<string>("clé-f", callback);

    expect(value).toBe("persisté");
    expect(store.getState<string>("clé-f")).toBe("persisté");
    expect(callback).toHaveBeenLastCalledWith("persisté");
  });
});
