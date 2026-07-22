/** Un élément capable de se rendre lui-même sous forme de nœud DOM. */
export interface Tag {
  toHtml(): HTMLElement;
}

interface BaseTagConfig {
  id?: string;
  class?: string;
  events?: Partial<Record<string, EventListener>>;
}

interface ButtonConfig extends BaseTagConfig {
  text?: string;
}

interface DivConfig extends BaseTagConfig {
  children?: HTMLElement[];
}

interface ImageConfig extends BaseTagConfig {
  src: string;
  alt?: string;
}

interface InputConfig extends BaseTagConfig {
  type?: string;
  placeholder?: string;
  value?: string;
}

interface HeadingConfig extends BaseTagConfig {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text?: string;
}

interface SpanConfig extends BaseTagConfig {
  text?: string;
}

interface ParagraphConfig extends BaseTagConfig {
  text?: string;
}

function applyBase(element: HTMLElement, config: BaseTagConfig): void {
  if (config.id !== undefined) {
    element.id = config.id;
  }
  if (config.class !== undefined) {
    element.className = config.class;
  }
  for (const [event, handler] of Object.entries(config.events ?? {})) {
    if (handler !== undefined) {
      element.addEventListener(event, handler);
    }
  }
}

export class ButtonTag implements Tag {
  constructor(private readonly config: ButtonConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement("button");
    applyBase(element, this.config);
    if (this.config.text !== undefined) {
      element.textContent = this.config.text;
    }
    return element;
  }
}

export class DivTag implements Tag {
  constructor(private readonly config: DivConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement("div");
    applyBase(element, this.config);
    for (const child of this.config.children ?? []) {
      element.appendChild(child);
    }
    return element;
  }
}

export class ImageTag implements Tag {
  constructor(private readonly config: ImageConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement("img");
    applyBase(element, this.config);
    element.src = this.config.src;
    if (this.config.alt !== undefined) {
      element.alt = this.config.alt;
    }
    return element;
  }
}

export class HorizontalRuleTag implements Tag {
  constructor(private readonly config: BaseTagConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement("hr");
    applyBase(element, this.config);
    return element;
  }
}

export class InputTag implements Tag {
  constructor(private readonly config: InputConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement("input");
    applyBase(element, this.config);
    element.type = this.config.type ?? "text";
    if (this.config.placeholder !== undefined) {
      element.placeholder = this.config.placeholder;
    }
    if (this.config.value !== undefined) {
      element.value = this.config.value;
    }
    return element;
  }
}

export class HeadingTag implements Tag {
  constructor(private readonly config: HeadingConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement(`h${this.config.level}`);
    applyBase(element, this.config);
    if (this.config.text !== undefined) {
      element.textContent = this.config.text;
    }
    return element;
  }
}

export class SpanTag implements Tag {
  constructor(private readonly config: SpanConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement("span");
    applyBase(element, this.config);
    if (this.config.text !== undefined) {
      element.textContent = this.config.text;
    }
    return element;
  }
}

export class ParagraphTag implements Tag {
  constructor(private readonly config: ParagraphConfig) {}

  toHtml(): HTMLElement {
    const element = document.createElement("p");
    applyBase(element, this.config);
    if (this.config.text !== undefined) {
      element.textContent = this.config.text;
    }
    return element;
  }
}

interface TagConfigMap {
  button: ButtonConfig;
  div: DivConfig;
  image: ImageConfig;
  hr: BaseTagConfig;
  input: InputConfig;
  heading: HeadingConfig;
  span: SpanConfig;
  paragraph: ParagraphConfig;
}

export type ElementType = keyof TagConfigMap;

type TagRegistry = {
  [K in ElementType]: new (config: TagConfigMap[K]) => Tag;
};

const registry: TagRegistry = {
  button: ButtonTag,
  div: DivTag,
  image: ImageTag,
  hr: HorizontalRuleTag,
  input: InputTag,
  heading: HeadingTag,
  span: SpanTag,
  paragraph: ParagraphTag,
};

/** Instancie le Tag concret correspondant à un ElementType — sans if/switch, via un registre de constructeurs. */
export class TagFactory {
  static create<K extends ElementType>(type: K, config: TagConfigMap[K]): Tag {
    const Ctor = registry[type];
    return new Ctor(config);
  }
}
