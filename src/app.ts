import { TagBuilder } from "./core/builder.ts";
import { TagFactory } from "./core/factory.ts";
import { AppConfig, AppStore } from "./core/singleton.ts";

export function renderApp(root: HTMLElement): void {
  AppConfig.getInstance().set("appName", "TaskFlow");
  const store = AppStore.getInstance();
  store.setState("clicks", 0);

  const counterLabel = TagFactory.create("paragraph", {
    class: "counter-label",
    text: "Clics : 0",
  }).toHtml();

  const incrementButton = new TagBuilder("button")
    .withClass("btn-primary")
    .withText("Cliquer ici")
    .withEvent("click", () => {
      const clicks = (store.getState<number>("clicks") ?? 0) + 1;
      store.setState("clicks", clicks);
      counterLabel.textContent = `Clics : ${clicks}`;
      counterLabel.style.color = clicks % 2 === 0 ? "#f1f5f9" : "#a78bfa";
    })
    .build();

  const shell = new TagBuilder("div")
    .withClass("app-shell")
    .withChild(
      TagFactory.create("heading", {
        level: 1,
        text: AppConfig.getInstance().get("appName") ?? "TaskFlow",
      }).toHtml(),
    )
    .withChild(counterLabel)
    .withChild(incrementButton)
    .withChild(TagFactory.create("hr", {}).toHtml())
    .build();

  root.appendChild(shell);
}
