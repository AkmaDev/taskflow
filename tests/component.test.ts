import { describe, expect, it, vi } from "vitest";
import { Component } from "../src/components/component.ts";

interface LabelProps {
  text: string;
}

class Label extends Component<LabelProps> {
  onMount = vi.fn();
  onUpdate = vi.fn();
  onDestroy = vi.fn();

  render(): HTMLElement {
    const element = document.createElement("span");
    element.textContent = this.props.text;
    return element;
  }
}

class Panel extends Component<{ text: string }> {
  child: Label | undefined;
  onDestroy = vi.fn();

  render(): HTMLElement {
    const element = document.createElement("div");
    this.child = new Label({ text: this.props.text });
    this.mountChild(this.child, element);
    return element;
  }
}

describe("Component", () => {
  it("insère l'élément rendu dans le container et appelle onMount", () => {
    const container = document.createElement("div");
    const label = new Label({ text: "Bonjour" });

    label.mount(container);

    expect(container.textContent).toBe("Bonjour");
    expect(label.onMount).toHaveBeenCalledOnce();
  });

  it("remplace le nœud existant et appelle onUpdate() lors d'un update()", () => {
    const container = document.createElement("div");
    const label = new Label({ text: "Bonjour" });
    const mounted = label.mount(container);

    label.update();

    expect(label.onUpdate).toHaveBeenCalledOnce();
    expect(container.contains(mounted)).toBe(false);
    expect(container.textContent).toBe("Bonjour");
  });

  it("retire l'élément du DOM et appelle onDestroy() lors d'un destroy()", () => {
    const container = document.createElement("div");
    const label = new Label({ text: "Bonjour" });
    label.mount(container);

    label.destroy();

    expect(container.children.length).toBe(0);
    expect(label.onDestroy).toHaveBeenCalledOnce();
  });

  it("mountChild() enregistre l'enfant et le détruit en cascade avec le parent", () => {
    const container = document.createElement("div");
    const panel = new Panel({ text: "Enfant" });
    panel.mount(container);

    expect(container.textContent).toBe("Enfant");

    panel.destroy();

    expect(panel.child?.onDestroy).toHaveBeenCalledOnce();
    expect(container.children.length).toBe(0);
  });
});
