import type { Observable } from "./observer.ts";

/**
 * Lie un input texte à un `Observable<string>` dans les deux sens : la
 * saisie met à jour l'Observable, et tout `next()` externe met à jour
 * l'input. Retourne une fonction pour couper la liaison.
 */
export function bindInput(input: HTMLInputElement, state: Observable<string>): () => void {
  const onInput = (): void => state.next(input.value);
  input.addEventListener("input", onInput);

  const unsubscribe = state.subscribe((value) => {
    if (input.value !== value) {
      input.value = value;
    }
  });

  return () => {
    input.removeEventListener("input", onInput);
    unsubscribe();
  };
}
