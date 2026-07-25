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
      nav.withChild(
        new TagBuilder("a")
          .withClass(window.location.pathname === link.path ? "nav-link nav-link-active" : "nav-link")
          .withText(link.label)
          .withEvent("click", (event) => {
            event.preventDefault();
            navigateTo(link.path);
          })
          .build(),
      );
    }
    return nav.build();
  }
}
