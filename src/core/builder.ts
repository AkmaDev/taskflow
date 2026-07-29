/** Builder fluide pour construire des éléments DOM complexes sans constructeurs surchargés. */
export class TagBuilder {
  private readonly classes = new Set<string>();
  private readonly styles = new Map<string, string>();
  private readonly events = new Map<string, EventListener>();
  private readonly content: Node[] = [];

  constructor(private readonly tag: string) {}

  /** Ajoute un nœud texte au contenu de l'élément. */
  withText(text: string): this {
    this.content.push(document.createTextNode(text));
    return this;
  }

  /** Ajoute une classe CSS à l'élément. */
  withClass(className: string): this {
    this.classes.add(className);
    return this;
  }

  /** Définit une propriété de style inline. */
  withStyle(property: string, value: string): this {
    this.styles.set(property, value);
    return this;
  }

  /** Attache un écouteur d'événement à l'élément. */
  withEvent(event: string, handler: EventListener): this {
    this.events.set(event, handler);
    return this;
  }

  /** Ajoute un élément enfant au contenu de l'élément. */
  withChild(child: HTMLElement): this {
    this.content.push(child);
    return this;
  }

  /** Retire une classe CSS précédemment ajoutée. */
  withoutClass(className: string): this {
    this.classes.delete(className);
    return this;
  }

  /** Retire l'écouteur précédemment attaché pour cet événement. */
  withoutEvent(event: string): this {
    this.events.delete(event);
    return this;
  }

  /** Construit et retourne l'élément HTMLElement final. */
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
