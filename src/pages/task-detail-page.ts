import { TagBuilder } from "../core/builder.ts";
import { TagFactory } from "../core/factory.ts";
import { Component } from "../components/component.ts";
import { HttpClient } from "../http/client.ts";
import { navigateTo } from "../router/router.ts";

/** Props de la page Détail : identifiant de la ressource distante à charger. */
export interface TaskDetailProps {
  id: string;
}

interface RemoteTodo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

const remoteClient = new HttpClient("https://jsonplaceholder.typicode.com");

/** Page Détail : récupère une ressource distante via HttpClient pour illustrer la comm HTTP + params de route. */
export class TaskDetailPage extends Component<TaskDetailProps> {
  private todo: RemoteTodo | undefined;
  private error: string | undefined;

  render(): HTMLElement {
    const backLink = new TagBuilder("a")
      .withClass("nav-link")
      .withText("← Retour à l'accueil")
      .withEvent("click", (event) => {
        event.preventDefault();
        navigateTo("/");
      })
      .build();

    const container = new TagBuilder("section").withClass("task-detail").withChild(backLink);

    if (this.error !== undefined) {
      container.withChild(TagFactory.create("paragraph", { class: "field-error", text: this.error }).toHtml());
    } else if (this.todo === undefined) {
      container.withChild(TagFactory.create("paragraph", { text: "Chargement…" }).toHtml());
    } else {
      container
        .withChild(TagFactory.create("heading", { level: 2, text: this.todo.title }).toHtml())
        .withChild(
          TagFactory.create("paragraph", {
            text: this.todo.completed ? "Statut : terminée" : "Statut : en cours",
          }).toHtml(),
        )
        .withChild(TagFactory.create("paragraph", { text: `Utilisateur #${this.todo.userId}` }).toHtml());
    }

    return container.build();
  }

  onMount(): void {
    remoteClient
      .get<RemoteTodo>(`/todos/${this.props.id}`)
      .then((todo) => {
        this.todo = todo;
        this.update();
      })
      .catch(() => {
        this.error = "Impossible de charger cette tâche distante.";
        this.update();
      });
  }
}
