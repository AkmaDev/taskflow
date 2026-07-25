import { describe, expect, it } from "vitest";
import { HomePage } from "../../src/pages/home-page.ts";

describe("HomePage", () => {
  it("affiche le titre de bienvenue et les liens de navigation", () => {
    const container = document.createElement("div");

    new HomePage({}).mount(container);

    expect(container.querySelector("h2")?.textContent).toBe("Bienvenue sur TaskFlow");
    expect(container.querySelectorAll(".remote-links li").length).toBe(3);
  });

  it("navigue vers /tasks au clic sur le bouton principal, sans recharger la page", () => {
    history.replaceState({}, "", "/");
    const container = document.createElement("div");
    new HomePage({}).mount(container);

    container.querySelector<HTMLAnchorElement>(".btn-primary")?.click();

    expect(window.location.pathname).toBe("/tasks");
  });

  it("navigue vers /remote/:id au clic sur un lien de démo", () => {
    history.replaceState({}, "", "/");
    const container = document.createElement("div");
    new HomePage({}).mount(container);

    container.querySelectorAll<HTMLAnchorElement>(".remote-links .nav-link")[1]?.click();

    expect(window.location.pathname).toBe("/remote/2");
  });
});
