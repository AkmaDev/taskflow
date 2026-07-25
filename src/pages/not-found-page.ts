import { TagBuilder } from "../core/builder.ts";
import { TagFactory } from "../core/factory.ts";
import { Component } from "../components/component.ts";
import { navigateTo } from "../router/router.ts";

/** Page affichée pour toute route inconnue. */
export class NotFoundPage extends Component {
  render(): HTMLElement {
    return new TagBuilder("section")
      .withClass("not-found")
      .withChild(TagFactory.create("heading", { level: 2, text: "Page introuvable" }).toHtml())
      .withChild(
        new TagBuilder("a")
          .withClass("nav-link")
          .withText("← Retour à l'accueil")
          .withEvent("click", (event) => {
            event.preventDefault();
            navigateTo("/");
          })
          .build(),
      )
      .build();
  }
}
