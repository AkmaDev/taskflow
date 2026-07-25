import { createFormField } from "./form-field.ts";
import { TagBuilder } from "../core/builder.ts";
import { TagFactory } from "../core/factory.ts";
import { AppStore } from "../core/singleton.ts";
import { MinLengthValidator, RequiredValidator } from "../core/validation.ts";

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = "tasks";

function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

function renderSummary(tasks: Task[]): string {
  if (tasks.length === 0) {
    return "Aucune tâche pour l'instant.";
  }
  const remaining = tasks.filter((task) => !task.done).length;
  return `${remaining} ${pluralize(remaining, "tâche")} restante${remaining === 1 ? "" : "s"} sur ${tasks.length}`;
}

function renderTaskItem(task: Task, onToggle: (id: string) => void, onRemove: (id: string) => void): HTMLElement {
  const checkbox = TagFactory.create("input", { type: "checkbox" }).toHtml() as HTMLInputElement;
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => onToggle(task.id));

  const label = TagFactory.create("span", {
    class: task.done ? "task-text task-text-done" : "task-text",
    text: task.text,
  }).toHtml();

  const deleteButton = new TagBuilder("button")
    .withClass("task-delete")
    .withText("✕")
    .withEvent("click", () => onRemove(task.id))
    .build();

  return new TagBuilder("li")
    .withClass("task-item")
    .withChild(checkbox)
    .withChild(label)
    .withChild(deleteButton)
    .build();
}

/**
 * Construit et monte le gestionnaire de tâches réactif dans `root`. L'état
 * vit dans le Singleton AppStore, rendu réactif par l'Observer (`subscribe`)
 * et modifié de façon prévisible via `dispatch` ; la liste se redessine
 * directement (sans virtual DOM) à chaque changement d'état.
 */
export async function mountTaskManager(root: HTMLElement): Promise<void> {
  const store = AppStore.getInstance();
  await store.load<Task[]>(STORAGE_KEY);

  function addTask(text: string): void {
    store.dispatch<Task[]>(STORAGE_KEY, (current) => [...(current ?? []), { id: crypto.randomUUID(), text, done: false }]);
  }

  function toggleTask(id: string): void {
    store.dispatch<Task[]>(STORAGE_KEY, (current) =>
      (current ?? []).map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function removeTask(id: string): void {
    store.dispatch<Task[]>(STORAGE_KEY, (current) => (current ?? []).filter((task) => task.id !== id));
  }

  const field = createFormField({
    placeholder: "Nouvelle tâche…",
    validators: [new RequiredValidator("La tâche ne peut pas être vide."), new MinLengthValidator(3)],
  });

  const submit = (): void => {
    if (!field.validate()) {
      return;
    }
    addTask(field.value.get().trim());
    field.reset();
  };

  field.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submit();
    }
  });

  const addButton = new TagBuilder("button")
    .withClass("btn-primary")
    .withText("Ajouter")
    .withEvent("click", submit)
    .build();

  const form = new TagBuilder("div").withClass("task-form").withChild(field.element).withChild(addButton).build();
  const summary = TagFactory.create("paragraph", { class: "task-summary" }).toHtml();
  const list = new TagBuilder("ul").withClass("task-list").build();

  store.subscribe<Task[]>(STORAGE_KEY, (current) => {
    const tasks = current ?? [];
    list.innerHTML = "";
    for (const task of tasks) {
      list.appendChild(renderTaskItem(task, toggleTask, removeTask));
    }
    summary.textContent = renderSummary(tasks);
  });

  root.appendChild(
    new TagBuilder("section").withClass("task-manager").withChild(form).withChild(summary).withChild(list).build(),
  );
}
