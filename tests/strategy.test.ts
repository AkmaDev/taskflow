import { beforeEach, describe, expect, it } from "vitest";
import {
  IndexedDBStorage,
  LocalStorageAdapter,
  VolatileStorage,
  type StorageStrategy,
} from "../src/core/strategy.ts";

function sharedContract(name: string, createStrategy: () => StorageStrategy) {
  describe(name, () => {
    let strategy: StorageStrategy;

    beforeEach(() => {
      strategy = createStrategy();
    });

    it("returns undefined for a missing key", async () => {
      await expect(strategy.get("missing")).resolves.toBeUndefined();
    });

    it("stores and retrieves a value", async () => {
      await strategy.set("theme", "dark");
      await expect(strategy.get("theme")).resolves.toBe("dark");
    });

    it("stores and retrieves complex objects", async () => {
      const user = { name: "Alice", role: "admin" };
      await strategy.set("user", user);
      await expect(strategy.get("user")).resolves.toEqual(user);
    });

    it("overwrites an existing value", async () => {
      await strategy.set("count", 1);
      await strategy.set("count", 2);
      await expect(strategy.get("count")).resolves.toBe(2);
    });

    it("removes a stored value", async () => {
      await strategy.set("count", 1);
      await strategy.remove("count");
      await expect(strategy.get("count")).resolves.toBeUndefined();
    });

    it("clears every stored value", async () => {
      await strategy.set("a", 1);
      await strategy.set("b", 2);
      await strategy.clear();
      await expect(strategy.get("a")).resolves.toBeUndefined();
      await expect(strategy.get("b")).resolves.toBeUndefined();
    });
  });
}

sharedContract("VolatileStorage", () => new VolatileStorage());
sharedContract("LocalStorageAdapter", () => new LocalStorageAdapter("test:"));
sharedContract(
  "IndexedDBStorage",
  () => new IndexedDBStorage(`test-db-${Math.random()}`, "keyvalue"),
);

describe("VolatileStorage", () => {
  it("does not persist data across separate instances", async () => {
    const first = new VolatileStorage();
    await first.set("a", 1);

    const second = new VolatileStorage();
    await expect(second.get("a")).resolves.toBeUndefined();
  });
});

describe("LocalStorageAdapter", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("namespaces keys with the given prefix", async () => {
    const adapter = new LocalStorageAdapter("app:");
    await adapter.set("count", 42);

    expect(window.localStorage.getItem("app:count")).toBe("42");
  });

  it("only clears keys under its own prefix", async () => {
    const adapter = new LocalStorageAdapter("app:");
    await adapter.set("count", 1);
    window.localStorage.setItem("other:count", "99");

    await adapter.clear();

    expect(window.localStorage.getItem("other:count")).toBe("99");
    await expect(adapter.get("count")).resolves.toBeUndefined();
  });
});
