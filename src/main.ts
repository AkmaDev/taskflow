import "./style.css";
import { renderApp } from "./app.ts";

const root = document.getElementById("app");
if (root === null) {
  throw new Error("Missing #app root element");
}

renderApp(root);
