import { beforeEach, describe, expect, it, vi } from "vitest";
import { Component } from "../src/components/component.ts";
import { Router } from "../src/router/router.ts";

class Page extends Component<{ label: string }> {
  render(): HTMLElement {
    const element = document.createElement("div");
    element.textContent = this.props.label;
    return element;
  }
}

function resetLocation(path: string): void {
  history.replaceState({}, "", path);
}

describe("Router", () => {
  beforeEach(() => {
    resetLocation("/");
  });

  it("start() monte le composant correspondant à la route courante", () => {
    resetLocation("/about");
    const container = document.createElement("div");
    const router = new Router(
      {
        "/": () => new Page({ label: "Accueil" }),
        "/about": () => new Page({ label: "À propos" }),
      },
      container,
    );

    router.start();

    expect(container.textContent).toBe("À propos");
  });

  it("navigate() pousse l'historique et monte la nouvelle route en détruisant l'ancienne", () => {
    const container = document.createElement("div");
    const router = new Router(
      {
        "/": () => new Page({ label: "Accueil" }),
        "/about": () => new Page({ label: "À propos" }),
      },
      container,
    );
    router.start();

    router.navigate("/about");

    expect(window.location.pathname).toBe("/about");
    expect(container.textContent).toBe("À propos");
    expect(container.children.length).toBe(1);
  });

  it("retombe sur la route '*' quand aucune route ne correspond", () => {
    resetLocation("/inconnu");
    const container = document.createElement("div");
    const router = new Router(
      {
        "/": () => new Page({ label: "Accueil" }),
        "*": () => new Page({ label: "404" }),
      },
      container,
    );

    router.start();

    expect(container.textContent).toBe("404");
  });

  it("onChange() notifie la route active à chaque navigation", () => {
    const container = document.createElement("div");
    const router = new Router(
      {
        "/": () => new Page({ label: "Accueil" }),
        "/about": () => new Page({ label: "À propos" }),
      },
      container,
    );
    const callback = vi.fn();
    router.onChange(callback);

    router.start();
    router.navigate("/about");

    expect(callback).toHaveBeenLastCalledWith("/about");
  });

  it("capture les segments dynamiques (:id) et les passe à la factory", () => {
    resetLocation("/tasks/42");
    const container = document.createElement("div");
    const factory = vi.fn(() => new Page({ label: "Détail" }));
    const router = new Router(
      {
        "/": () => new Page({ label: "Accueil" }),
        "/tasks/:id": factory,
      },
      container,
    );

    router.start();

    expect(factory).toHaveBeenCalledWith({ id: "42" });
    expect(container.textContent).toBe("Détail");
  });

  it("réagit à l'événement popstate en re-rendant la route courante", () => {
    const container = document.createElement("div");
    const router = new Router(
      {
        "/": () => new Page({ label: "Accueil" }),
        "/about": () => new Page({ label: "À propos" }),
      },
      container,
    );
    router.start();

    resetLocation("/about");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(container.textContent).toBe("À propos");
  });
});
