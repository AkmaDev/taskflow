/**
 * Vue minimale d'un Component, sans référence à son type de Props — c'est ce
 * type que le Router manipule, pour pouvoir monter des composants aux Props
 * différentes derrière une même table de routes.
 */
export interface Mountable {
  mount(container: HTMLElement): HTMLElement;
  update(): void;
  destroy(): void;
}

/**
 * Composant réutilisable encapsulant état, rendu et cycle de vie
 * (onMount/onUpdate/onDestroy). Le rendu se fait sans virtual DOM : `render()`
 * reconstruit l'élément et `update()` le remplace directement dans le DOM.
 */
export abstract class Component<Props = Record<string, unknown>> implements Mountable {
  protected readonly props: Props;
  protected element: HTMLElement | undefined;
  private readonly mountedChildren: Mountable[] = [];

  constructor(props: Props) {
    this.props = props;
  }

  abstract render(): HTMLElement;

  onMount(): void {}
  onUpdate(): void {}
  onDestroy(): void {}

  /** Rend le composant et l'insère dans `container`. */
  mount(container: HTMLElement): HTMLElement {
    this.element = this.render();
    container.appendChild(this.element);
    this.onMount();
    return this.element;
  }

  /** Re-rend le composant et remplace son nœud existant par le nouveau. */
  update(): void {
    if (this.element === undefined) {
      return;
    }
    this.destroyChildren();
    const next = this.render();
    this.element.replaceWith(next);
    this.element = next;
    this.onUpdate();
  }

  /** Retire le composant du DOM et détruit en cascade les enfants montés via mountChild(). */
  destroy(): void {
    if (this.element === undefined) {
      return;
    }
    this.destroyChildren();
    this.element.remove();
    this.element = undefined;
    this.onDestroy();
  }

  /**
   * Monte un composant enfant dans un nœud du rendu courant et l'enregistre
   * pour qu'il soit détruit automatiquement avec ce composant — c'est le
   * mécanisme de composition (slots) : un parent peut instancier des enfants
   * réutilisables dans son render() sans gérer leur cycle de vie manuellement.
   */
  protected mountChild(child: Mountable, container: HTMLElement): HTMLElement {
    this.mountedChildren.push(child);
    return child.mount(container);
  }

  private destroyChildren(): void {
    for (const child of this.mountedChildren) {
      child.destroy();
    }
    this.mountedChildren.length = 0;
  }
}
