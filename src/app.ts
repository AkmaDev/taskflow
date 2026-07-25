import { Nav } from "./components/nav.ts";
import { TagBuilder } from "./core/builder.ts";
import { TagFactory } from "./core/factory.ts";
import { AppConfig, AppStore } from "./core/singleton.ts";
import { LocalStorageAdapter } from "./core/strategy.ts";
import { HomePage } from "./pages/home-page.ts";
import { NotFoundPage } from "./pages/not-found-page.ts";
import { TaskDetailPage } from "./pages/task-detail-page.ts";
import { TasksPage } from "./pages/tasks-page.ts";
import { Router } from "./router/router.ts";

export function renderApp(root: HTMLElement): void {
  AppConfig.getInstance().set("appName", "TaskFlow");
  AppStore.getInstance().setStrategy(new LocalStorageAdapter("taskflow:"));

  const nav = new Nav({});
  const outlet = new TagBuilder("div").withClass("page-outlet").build();

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
  nav.mount(shell);
  shell.appendChild(outlet);

  const router = new Router(
    {
      "/": () => new HomePage({}),
      "/tasks": () => new TasksPage({}),
      "/remote/:id": (params) => new TaskDetailPage({ id: params.id }),
      "*": () => new NotFoundPage({}),
    },
    outlet,
  );
  router.onChange(() => nav.update());
  router.start();
}
