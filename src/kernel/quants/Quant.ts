import { LitElement } from 'lit-element';

export default class Quant extends LitElement {
  public static recursiveModel(constructor: any): any {
    let properties = {};
    if (constructor.recursiveModel !== undefined) {
      const parentConstructor = Object.getPrototypeOf(constructor);
      properties = constructor.recursiveModel(parentConstructor);

      Object.entries(constructor.model).forEach(prop => {
        if (!properties[prop[0]]) {
          properties[prop[0]] = prop[1];
        }
      });
    }
    return properties;
  }

  public autosave: any;
  public initialized: boolean;
  public root: ShadowRoot | undefined;

  constructor() {
    super();
    this.initialized = false;
    this.autosave = true;
  }

  /* #region static getter */
  static get model(): any {
    return {};
  }

  static get properties(): any {
    const props = JSON.parse(JSON.stringify(this.model));
    Object.keys(props).map((key: any) => {
      const item = props[key];
      if (item.type === 'array') {
        item.type = Array;
      }
      if (item.type === 'object') {
        item.type = Object;
      }
      if (item.type === 'property') {
        item.type = 'object';
      }
      props[key] = item;
    });
    return props;
  }
  /* #endregion */
  /* #region getters */
  get hasSlot(): boolean {
    return this.renderRoot.querySelector('slot') !== undefined;
  }

  get slots(): any {
    return this.renderRoot.querySelectorAll('slot');
  }

  get language(): string {
    return navigator.language;
  }
  /* #endregion */
  /* #region child/slot logic */
  public append(node: Node): void {
    if (this.hasSlot) {
      super.append(node);
    } else if (this.parentElement) {
      this.parentElement.insertBefore(node, this.nextSibling);
    } else {
      document.append(node);
    }
  }

  public clear(): void {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
  }
  /* #endregion */
  /* #region rendering */
  public render(): any {
    return window.omo.html`<p>Please implement render function<p>`;
  }

  public createRenderRoot(): any {
    this.root = this.attachShadow({
      mode: 'open'
    });
    return this.root;
  }
  /* #endregion */
  /* #region lifecycle */
  public async initAsync(): Promise<void> {
    /**/
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.initAsync().then(() => (this.initialized = true));
  }
  /* #endregion */
}
