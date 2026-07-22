import { describe, expect, it } from "vitest";
import { EmailValidator, MinLengthValidator, PatternValidator, RequiredValidator, validateField } from "../src/core/validation.ts";

describe("RequiredValidator", () => {
  it("rejette une chaîne vide ou composée d'espaces", () => {
    const validator = new RequiredValidator();
    expect(validator.validate("")).toBe(false);
    expect(validator.validate("   ")).toBe(false);
  });

  it("accepte une chaîne non vide", () => {
    expect(new RequiredValidator().validate("Alice")).toBe(true);
  });
});

describe("EmailValidator", () => {
  it("accepte une adresse email valide", () => {
    expect(new EmailValidator().validate("alice@example.com")).toBe(true);
  });

  it("rejette une adresse email invalide", () => {
    expect(new EmailValidator().validate("pas-un-email")).toBe(false);
  });
});

describe("MinLengthValidator", () => {
  it("rejette une valeur trop courte", () => {
    expect(new MinLengthValidator(3).validate("ab")).toBe(false);
  });

  it("accepte une valeur assez longue", () => {
    expect(new MinLengthValidator(3).validate("abc")).toBe(true);
  });

  it("utilise un message par défaut basé sur la longueur minimale", () => {
    expect(new MinLengthValidator(5).message).toBe("Doit contenir au moins 5 caractères.");
  });
});

describe("PatternValidator", () => {
  it("valide selon l'expression régulière fournie", () => {
    const validator = new PatternValidator(/^\d+$/, "Doit être un nombre.");
    expect(validator.validate("1234")).toBe(true);
    expect(validator.validate("12a4")).toBe(false);
  });
});

describe("validateField", () => {
  it("retourne null quand toutes les stratégies passent", () => {
    const result = validateField("alice@example.com", [new RequiredValidator(), new EmailValidator()]);
    expect(result).toBeNull();
  });

  it("retourne le message de la première stratégie qui échoue", () => {
    const result = validateField("", [new RequiredValidator("Requis"), new EmailValidator("Email invalide")]);
    expect(result).toBe("Requis");
  });

  it("retourne null quand il n'y a aucune stratégie", () => {
    expect(validateField("peu importe", [])).toBeNull();
  });
});
