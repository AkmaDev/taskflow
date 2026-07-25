import { describe, expect, it } from "vitest";
import { Card } from "../src/components/card.ts";

describe("Card", () => {
  it("affiche le titre et les enfants passés en slot", () => {
    const container = document.createElement("div");
    const child = document.createElement("p");
    child.textContent = "Contenu personnalisé";

    new Card({ title: "Mon titre", children: [child] }).mount(container);

    expect(container.querySelector(".card-title")?.textContent).toBe("Mon titre");
    expect(container.querySelector(".card-body")?.contains(child)).toBe(true);
  });

  it("fonctionne sans enfants fournis", () => {
    const container = document.createElement("div");

    new Card({ title: "Vide" }).mount(container);

    expect(container.querySelector(".card-body")?.children.length).toBe(0);
  });
});
