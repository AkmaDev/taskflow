import { Observable } from "../core/observer.ts";
import type { Mountable } from "../components/component.ts";

export type RouteParams = Record<string, string>;
export type RouteFactory = (params: RouteParams) => Mountable;

/** Retourne les params capturés si `path` correspond au pattern (segments `:nom`), sinon `undefined`. */
function matchRoute(pattern: string, path: string): RouteParams | undefined {
  const patternSegments = pattern.split("/").filter((segment) => segment !== "");
  const pathSegments = path.split("/").filter((segment) => segment !== "");
  if (patternSegments.length !== pathSegments.length) {
    return undefined;
  }

  const params: RouteParams = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]!;
    const pathSegment = pathSegments[i]!;
    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = pathSegment;
    } else if (patternSegment !== pathSegment) {
      return undefined;
    }
  }
  return params;
}

/**
 * Navigue vers `path` sans avoir de référence directe au Router (ex. un lien
 * dans une page). Pousse l'historique puis émet `popstate`, que toute
 * instance de Router à l'écoute capte pour se re-rendre.
 */
export function navigateTo(path: string): void {
  if (window.location.pathname === path) {
    return;
  }
  history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/**
 * Router client basé sur l'History API. Monte le composant correspondant à
 * la route active dans un container, et notifie les changements de route via
 * un Observable (Observer) pour que d'autres parties de l'app puissent réagir.
 */
export class Router {
  private readonly routeChange: Observable<string>;
  private currentComponent: Mountable | undefined;

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
    navigateTo(path);
  }

  /** S'abonne aux changements de route ; retourne une fonction de désabonnement. */
  onChange(callback: (path: string) => void): () => void {
    return this.routeChange.subscribe(callback);
  }

  private render(path: string): void {
    const match = this.matchFactory(path);
    if (match === undefined) {
      return;
    }
    this.currentComponent?.destroy();
    this.currentComponent = match.factory(match.params);
    this.currentComponent.mount(this.container);
    this.routeChange.next(path);
  }

  private matchFactory(path: string): { factory: RouteFactory; params: RouteParams } | undefined {
    for (const [pattern, factory] of Object.entries(this.routes)) {
      if (pattern === "*") {
        continue;
      }
      const params = matchRoute(pattern, path);
      if (params !== undefined) {
        return { factory, params };
      }
    }
    const fallback = this.routes["*"];
    return fallback === undefined ? undefined : { factory: fallback, params: {} };
  }
}
