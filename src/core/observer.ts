/**
 * Observable value: holds the current state and notifies subscribers
 * whenever it changes, without coupling emitter and receivers.
 */
export class Observable<T> {
  private value: T;
  private readonly subscribers: Array<(value: T) => void> = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  /** Returns the current value without subscribing. */
  get(): T {
    return this.value;
  }

  /**
   * Subscribes to future values; the callback also fires immediately with
   * the current value. Returns an unsubscribe function.
   */
  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.push(callback);
    callback(this.value);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /** Emits a new value to every current subscriber. */
  next(value: T): void {
    this.value = value;
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }
}
