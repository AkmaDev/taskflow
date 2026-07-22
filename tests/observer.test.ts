import { describe, expect, it, vi } from "vitest";
import { Observable } from "../src/core/observer.ts";

describe("Observable", () => {
  it("expose la valeur initiale via get()", () => {
    const counter = new Observable(0);
    expect(counter.get()).toBe(0);
  });

  it("appelle un nouvel abonné immédiatement avec la valeur courante", () => {
    const counter = new Observable(42);
    const callback = vi.fn();
    counter.subscribe(callback);
    expect(callback).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("notifie tous les abonnés quand next() est appelé", () => {
    const counter = new Observable(0);
    const first = vi.fn();
    const second = vi.fn();
    counter.subscribe(first);
    counter.subscribe(second);

    counter.next(1);

    expect(first).toHaveBeenLastCalledWith(1);
    expect(second).toHaveBeenLastCalledWith(1);
  });

  it("met à jour get() après next()", () => {
    const counter = new Observable(0);
    counter.next(5);
    expect(counter.get()).toBe(5);
  });

  it("arrête de notifier un abonné après son désabonnement", () => {
    const counter = new Observable(0);
    const callback = vi.fn();
    const unsubscribe = counter.subscribe(callback);
    callback.mockClear();

    unsubscribe();
    counter.next(1);

    expect(callback).not.toHaveBeenCalled();
  });

  it("ne désabonne que le callback ciblé, pas les autres abonnés", () => {
    const counter = new Observable(0);
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = counter.subscribe(first);
    counter.subscribe(second);

    unsubscribeFirst();
    counter.next(1);

    expect(first).not.toHaveBeenCalledWith(1);
    expect(second).toHaveBeenLastCalledWith(1);
  });
});
