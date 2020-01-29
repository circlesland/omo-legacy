import { LitElement } from 'lit-element';

export default class Quant extends LitElement {
  get hasSlot(): boolean {
    return this.renderRoot.querySelector('slot') !== undefined;
  }

  get slots(): any {
    return this.renderRoot.querySelectorAll('slot');
  }

  static get model(): any {
    return {};
  }

  // extracted model for LIT Element
  static get properties(): any {
    console.log('LIT PROPERTIES', this.model);

    const props = JSON.parse(JSON.stringify(this.model));

    Object.keys(props).map((key: any) => {
      const item = props[key];

      if (item.type === 'property') {
        item.type = 'object';
      }
      props[key] = item;
    });

    // Make it conform for lit
    return props;
  }

  // getModelRecursive(constructor: Function, properties: {}) {
  //   if (constructor.model) {
  //     Object.entries(constructor.model).forEach(prop => {
  //       if (!properties[prop[0]]) properties[prop[0]] = prop[1];
  //     });
  //     properties = this.getModelRecursive(
  //       Object.getPrototypeOf(constructor),
  //       properties
  //     );
  //   }
  //   return properties;
  // }

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
    this.init();
    this.initAsync().then(() => (this.initialized = true));
  }

  public render(): any {
    return window.omo.html`<p>Please implement render function<p>`;
  }

  public append(node: Node): void {
    if (this.hasSlot) {
      super.append(node);
    } else if (this.parentElement) {
      this.parentElement.insertBefore(node, this.nextSibling);
    } else {
      document.append(node);
    }
  }

  public createRenderRoot(): any {
    this.root = this.attachShadow({
      mode: 'open'
    });
    return this.root;
  }

  public init(): void {
    // this.initAsync().then(() => this.initialized = true);
  }

  public async initAsync(): Promise<void> {
    /**/
  }
}

declare global {
  interface Function {
    model: any;
    recursiveModel: any;
    createSchemaProperties: any;
    createJsonSchema: any;
    getModelName: any;
    _model: any;
    _modelName: any;
    Init: any;
    schemaProperties: any;
  }
}
