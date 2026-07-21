/** Fluent builder for constructing complex DOM elements without overloaded constructors. */
export class TagBuilder {
  private readonly classes = new Set<string>();
  private readonly styles = new Map<string, string>();
  private readonly events = new Map<string, EventListener>();
  private readonly content: Node[] = [];

  constructor(private readonly tag: string) {}

  withText(text: string): this {
    this.content.push(document.createTextNode(text));
    return this;
  }

  withClass(className: string): this {
    this.classes.add(className);
    return this;
  }

  withStyle(property: string, value: string): this {
    this.styles.set(property, value);
    return this;
  }

  withEvent(event: string, handler: EventListener): this {
    this.events.set(event, handler);
    return this;
  }

  withChild(child: HTMLElement): this {
    this.content.push(child);
    return this;
  }

  withoutClass(className: string): this {
    this.classes.delete(className);
    return this;
  }

  withoutEvent(event: string): this {
    this.events.delete(event);
    return this;
  }

  build(): HTMLElement {
    const element = document.createElement(this.tag);

    if (this.classes.size > 0) {
      element.classList.add(...this.classes);
    }

    for (const [property, value] of this.styles) {
      element.style.setProperty(property, value);
    }

    for (const [event, handler] of this.events) {
      element.addEventListener(event, handler);
    }

    for (const node of this.content) {
      element.appendChild(node);
    }

    return element;
  }
}
