import { Observable } from "../core/observer.ts";
import type { Component } from "../components/component.ts";

export type RouteFactory = () => Component;

/**
 * Router client basé sur l'History API. Monte le composant correspondant à
 * la route active dans un container, et notifie les changements de route via
 * un Observable (Observer) pour que d'autres parties de l'app puissent réagir.
 */
export class Router {
  private readonly routeChange: Observable<string>;
  private currentComponent: Component | undefined;

  constructor(
    private readonly routes: Record<string, RouteFactory>,
    private readonly container: HTMLElement,
  ) {
    this.routeChange = new Observable<string>(window.location.pathname);
    window.addEventListener("popstate", () => {
      this.render(window.location.pathname);
    });
  }

  /** Rend la route actuelle sans modifier l'historique — à appeler une fois au démarrage. */
  start(): void {
    this.render(window.location.pathname);
  }

  /** Pousse une nouvelle entrée d'historique et rend la route correspondante. */
  navigate(path: string): void {
    if (window.location.pathname === path) {
      return;
    }
    history.pushState({}, "", path);
    this.render(path);
  }

  /** S'abonne aux changements de route ; retourne une fonction de désabonnement. */
  onChange(callback: (path: string) => void): () => void {
    return this.routeChange.subscribe(callback);
  }

  private render(path: string): void {
    const factory = this.routes[path] ?? this.routes["*"];
    if (factory === undefined) {
      return;
    }
    this.currentComponent?.destroy();
    this.currentComponent = factory();
    this.currentComponent.mount(this.container);
    this.routeChange.next(path);
  }
}
