/** Stratégie de validation d'un champ : une règle et le message d'erreur associé. */
export interface ValidationStrategy {
  /** Message d'erreur affiché quand la validation échoue. */
  readonly message: string;
  /** Retourne `true` si `value` respecte la règle. */
  validate(value: string): boolean;
}

/** Valide que le champ n'est pas vide (espaces ignorés). */
export class RequiredValidator implements ValidationStrategy {
  readonly message: string;

  constructor(message = "Ce champ est requis.") {
    this.message = message;
  }

  validate(value: string): boolean {
    return value.trim() !== "";
  }
}

/** Valide un format d'adresse email simple. */
export class EmailValidator implements ValidationStrategy {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  readonly message: string;

  constructor(message = "Adresse email invalide.") {
    this.message = message;
  }

  validate(value: string): boolean {
    return EmailValidator.PATTERN.test(value);
  }
}

/** Valide une longueur minimale. */
export class MinLengthValidator implements ValidationStrategy {
  readonly message: string;

  constructor(
    private readonly min: number,
    message?: string,
  ) {
    this.message = message ?? `Doit contenir au moins ${min} caractères.`;
  }

  validate(value: string): boolean {
    return value.length >= this.min;
  }
}

/** Valide que le champ respecte une expression régulière donnée. */
export class PatternValidator implements ValidationStrategy {
  readonly message: string;

  constructor(
    private readonly pattern: RegExp,
    message = "Format invalide.",
  ) {
    this.message = message;
  }

  validate(value: string): boolean {
    return this.pattern.test(value);
  }
}

/**
 * Applique chaque stratégie à `value`, dans l'ordre, et retourne le premier
 * message d'erreur rencontré — ou `null` si toutes les stratégies passent.
 */
export function validateField(value: string, strategies: readonly ValidationStrategy[]): string | null {
  for (const strategy of strategies) {
    if (!strategy.validate(value)) {
      return strategy.message;
    }
  }
  return null;
}
