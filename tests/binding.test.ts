import { describe, expect, it } from "vitest";
import { bindInput } from "../src/core/binding.ts";
import { Observable } from "../src/core/observer.ts";

function createInput(): HTMLInputElement {
  return document.createElement("input");
}

describe("bindInput", () => {
  it("initialise l'input avec la valeur courante de l'Observable", () => {
    const state = new Observable("valeur initiale");
    const input = createInput();
    bindInput(input, state);
    expect(input.value).toBe("valeur initiale");
  });

  it("met à jour l'Observable quand l'utilisateur tape dans l'input", () => {
    const state = new Observable("");
    const input = createInput();
    bindInput(input, state);

    input.value = "nouvelle valeur";
    input.dispatchEvent(new Event("input"));

    expect(state.get()).toBe("nouvelle valeur");
  });

  it("met à jour l'input quand l'Observable émet une nouvelle valeur", () => {
    const state = new Observable("");
    const input = createInput();
    bindInput(input, state);

    state.next("valeur externe");

    expect(input.value).toBe("valeur externe");
  });

  it("coupe la liaison dans les deux sens après l'appel de la fonction retournée", () => {
    const state = new Observable("");
    const input = createInput();
    const unbind = bindInput(input, state);

    unbind();

    input.value = "ignoré";
    input.dispatchEvent(new Event("input"));
    expect(state.get()).toBe("");

    state.next("ignoré aussi");
    expect(input.value).toBe("ignoré");
  });
});
