import { describe, expect, it, vi } from "vitest";
import { Observable } from "../src/core/observer.ts";

describe("Observable", () => {
  it("exposes the initial value via get()", () => {
    const counter = new Observable(0);
    expect(counter.get()).toBe(0);
  });

  it("calls a new subscriber immediately with the current value", () => {
    const counter = new Observable(42);
    const callback = vi.fn();
    counter.subscribe(callback);
    expect(callback).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("notifies every subscriber when next() is called", () => {
    const counter = new Observable(0);
    const first = vi.fn();
    const second = vi.fn();
    counter.subscribe(first);
    counter.subscribe(second);

    counter.next(1);

    expect(first).toHaveBeenLastCalledWith(1);
    expect(second).toHaveBeenLastCalledWith(1);
  });

  it("updates get() after next()", () => {
    const counter = new Observable(0);
    counter.next(5);
    expect(counter.get()).toBe(5);
  });

  it("stops notifying a subscriber after it unsubscribes", () => {
    const counter = new Observable(0);
    const callback = vi.fn();
    const unsubscribe = counter.subscribe(callback);
    callback.mockClear();

    unsubscribe();
    counter.next(1);

    expect(callback).not.toHaveBeenCalled();
  });

  it("only unsubscribes the targeted callback, not other subscribers", () => {
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
