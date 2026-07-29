import { bindInput } from "../core/binding.ts";
import { TagBuilder } from "../core/builder.ts";
import { TagFactory } from "../core/factory.ts";
import { Observable } from "../core/observer.ts";
import { type ValidationStrategy, validateField } from "../core/validation.ts";

/** Options de création d'un FormField. */
export interface FormFieldOptions {
  /** Texte affiché quand le champ est vide. */
  placeholder: string;
  /** Type HTML de l'input (`text` par défaut). */
  type?: string;
  /** Stratégies de validation appliquées à la valeur du champ. */
  validators?: readonly ValidationStrategy[];
}

/** Champ de formulaire construit par createFormField, exposant sa valeur réactive et sa validation. */
export interface FormField {
  /** Élément prêt à insérer dans le DOM (input + zone d'erreur). */
  readonly element: HTMLElement;
  /** Champ texte brut, utile pour brancher des écouteurs supplémentaires (ex. touche Entrée). */
  readonly input: HTMLInputElement;
  /** Valeur courante, liée dans les deux sens à l'input. */
  readonly value: Observable<string>;
  /** Valide la valeur courante, affiche/efface le message d'erreur, retourne true si valide. */
  validate(): boolean;
  /** Vide le champ et efface l'erreur affichée. */
  reset(): void;
}

/** Champ de formulaire avec binding bidirectionnel (Observable) et validation par Strategy. */
export function createFormField(options: FormFieldOptions): FormField {
  const value = new Observable("");
  const input = TagFactory.create("input", {
    class: "task-input",
    type: options.type,
    placeholder: options.placeholder,
  }).toHtml() as HTMLInputElement;
  bindInput(input, value);

  const error = TagFactory.create("span", { class: "field-error" }).toHtml();

  function validate(): boolean {
    const message = validateField(value.get(), options.validators ?? []);
    error.textContent = message ?? "";
    input.classList.toggle("input-invalid", message !== null);
    return message === null;
  }

  value.subscribe(() => {
    if (error.textContent) {
      validate();
    }
  });

  function reset(): void {
    value.next("");
    error.textContent = "";
    input.classList.remove("input-invalid");
  }

  const element = new TagBuilder("div").withClass("form-field").withChild(input).withChild(error).build();

  return { element, input, value, validate, reset };
}
