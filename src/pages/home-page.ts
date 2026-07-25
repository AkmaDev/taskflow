import { TagBuilder } from "../core/builder.ts";
import { TagFactory } from "../core/factory.ts";
import { Component } from "../components/component.ts";
import { navigateTo } from "../router/router.ts";

/** Page d'accueil : présentation de l'app et liens de démo vers les autres pages. */
export class HomePage extends Component {
  render(): HTMLElement {
    const remoteLinks = new TagBuilder("ul").withClass("remote-links");
    for (const id of [1, 2, 3]) {
      remoteLinks.withChild(
        new TagBuilder("li")
          .withChild(
            new TagBuilder("a")
              .withClass("nav-link")
              .withText(`Tâche distante #${id}`)
              .withEvent("click", (event) => {
                event.preventDefault();
                navigateTo(`/remote/${id}`);
              })
              .build(),
          )
          .build(),
      );
    }

    return new TagBuilder("section")
      .withClass("page-home")
      .withChild(TagFactory.create("heading", { level: 2, text: "Bienvenue sur TaskFlow" }).toHtml())
      .withChild(
        TagFactory.create("paragraph", {
          text: "Un mini-framework TypeScript maison : composants avec cycle de vie, routeur, store réactif, validation de formulaires et client HTTP.",
        }).toHtml(),
      )
      .withChild(
        new TagBuilder("a")
          .withClass("btn-primary")
          .withText("Voir mes tâches")
          .withEvent("click", (event) => {
            event.preventDefault();
            navigateTo("/tasks");
          })
          .build(),
      )
      .withChild(TagFactory.create("paragraph", { class: "remote-links-title", text: "Démo client HTTP :" }).toHtml())
      .withChild(remoteLinks.build())
      .build();
  }
}
