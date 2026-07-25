import { TagBuilder } from "../core/builder.ts";
import { Component } from "./component.ts";
import { navigateTo } from "../router/router.ts";

interface NavLink {
  path: string;
  label: string;
}

const LINKS: readonly NavLink[] = [
  { path: "/", label: "Accueil" },
  { path: "/tasks", label: "Mes tâches" },
];

/** Barre de navigation persistante : liens gérés par le Router (pas de rechargement de page). */
export class Nav extends Component {
  render(): HTMLElement {
    const nav = new TagBuilder("nav").withClass("nav");
    for (const link of LINKS) {
      const linkBuilder = new TagBuilder("a")
        .withClass("nav-link")
        .withText(link.label)
        .withEvent("click", (event) => {
          event.preventDefault();
          navigateTo(link.path);
        });
      if (window.location.pathname === link.path) {
        linkBuilder.withClass("nav-link-active");
      }
      nav.withChild(linkBuilder.build());
    }
    return nav.build();
  }
}
