import { Component } from "../components/component.ts";
import { mountTaskManager } from "../components/task-manager.ts";

/** Page "Mes tâches" : délègue entièrement au gestionnaire de tâches réactif existant. */
export class TasksPage extends Component {
  render(): HTMLElement {
    return document.createElement("div");
  }

  onMount(): void {
    if (this.element === undefined) {
      return;
    }
    void mountTaskManager(this.element);
  }
}
