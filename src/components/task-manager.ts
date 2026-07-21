import { TagBuilder } from "../core/builder.ts";
import { TagFactory } from "../core/factory.ts";
import { Observable } from "../core/observer.ts";
import { AppStore } from "../core/singleton.ts";

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
 * Builds and mounts the reactive task manager into `root`. Tasks are held
 * in an Observable, persisted through the Singleton AppStore, and the list
 * re-renders directly (no virtual DOM) whenever the Observable emits.
 */
export async function mountTaskManager(root: HTMLElement): Promise<void> {
  const store = AppStore.getInstance();
  const persisted = await store.load<Task[]>(STORAGE_KEY);
  const tasks = new Observable<Task[]>(persisted ?? []);

  function commit(next: Task[]): void {
    store.setState(STORAGE_KEY, next);
    tasks.next(next);
  }

  function addTask(rawText: string): void {
    const text = rawText.trim();
    if (text === "") {
      return;
    }
    commit([...tasks.get(), { id: crypto.randomUUID(), text, done: false }]);
  }

  function toggleTask(id: string): void {
    commit(tasks.get().map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  function removeTask(id: string): void {
    commit(tasks.get().filter((task) => task.id !== id));
  }

  const input = TagFactory.create("input", {
    class: "task-input",
    placeholder: "Nouvelle tâche…",
  }).toHtml() as HTMLInputElement;

  const submit = (): void => {
    addTask(input.value);
    input.value = "";
    input.focus();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submit();
    }
  });

  const addButton = new TagBuilder("button")
    .withClass("btn-primary")
    .withText("Ajouter")
    .withEvent("click", submit)
    .build();

  const form = new TagBuilder("div").withClass("task-form").withChild(input).withChild(addButton).build();
  const summary = TagFactory.create("paragraph", { class: "task-summary" }).toHtml();
  const list = new TagBuilder("ul").withClass("task-list").build();

  tasks.subscribe((current) => {
    list.innerHTML = "";
    for (const task of current) {
      list.appendChild(renderTaskItem(task, toggleTask, removeTask));
    }
    summary.textContent = renderSummary(current);
  });

  root.appendChild(
    new TagBuilder("section").withClass("task-manager").withChild(form).withChild(summary).withChild(list).build(),
  );
}
