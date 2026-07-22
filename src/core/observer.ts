/**
 * Valeur observable : conserve l'état courant et notifie les abonnés
 * à chaque changement, sans coupler l'émetteur et les récepteurs.
 */
export class Observable<T> {
  private value: T;
  private readonly subscribers: Array<(value: T) => void> = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  /** Retourne la valeur courante sans s'abonner. */
  get(): T {
    return this.value;
  }

  /**
   * S'abonne aux valeurs futures ; le callback est aussi appelé immédiatement
   * avec la valeur courante. Retourne une fonction de désabonnement.
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

  /** Émet une nouvelle valeur à tous les abonnés actuels. */
  next(value: T): void {
    this.value = value;
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }
}
