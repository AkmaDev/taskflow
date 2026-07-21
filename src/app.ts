import { mountTaskManager } from "./components/task-manager.ts";
import { TagBuilder } from "./core/builder.ts";
import { TagFactory } from "./core/factory.ts";
import { AppConfig, AppStore } from "./core/singleton.ts";
import { LocalStorageAdapter } from "./core/strategy.ts";

export function renderApp(root: HTMLElement): void {
  AppConfig.getInstance().set("appName", "TaskFlow");
  AppStore.getInstance().setStrategy(new LocalStorageAdapter("taskflow:"));

  const shell = new TagBuilder("div")
    .withClass("app-shell")
    .withChild(
      TagFactory.create("heading", {
        level: 1,
        text: AppConfig.getInstance().get("appName") ?? "TaskFlow",
      }).toHtml(),
    )
    .withChild(
      TagFactory.create("paragraph", {
        class: "app-subtitle",
        text: "Gestionnaire de tâches réactif",
      }).toHtml(),
    )
    .build();

  root.appendChild(shell);
  void mountTaskManager(shell);
}
