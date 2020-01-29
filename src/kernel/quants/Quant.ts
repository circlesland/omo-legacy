import { LitElement } from "lit-element";

export default class Quant extends LitElement {
  _root: ShadowRoot | undefined;
  name: string;
  autosave: any;

  constructor() {
    super();
    this.name = "";
    this.autosave = true;
  }

  render() {
    return window.omo.html`<p>Please implement render function<p>`;
  }

  get hasSlot() {
    return this.renderRoot.querySelector("slot") != undefined;
  }

  get slots() {
    return this.renderRoot.querySelectorAll("slot");
  }

  append(node: Node) {
    if (this.hasSlot) super.append(node);
    else if (this.parentElement)
      this.parentElement.insertBefore(node, this.nextSibling);
    else document.append(node);
  }

  createRenderRoot() {
    this._root = this.attachShadow({
      mode: "open"
    });
    return this._root;
  }

  init() {
    this.initAsync();
  }

  static get model() {
    return {};
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

  static recursiveModel(constructor: Function): any {
    let properties = {};
    if (constructor.recursiveModel != undefined) {
      let parentConstructor = Object.getPrototypeOf(constructor);
      properties = constructor.recursiveModel(parentConstructor);

      Object.entries(constructor.model).forEach(prop => {
        if (!properties[prop[0]]) properties[prop[0]] = prop[1];
      });
    }
    return properties;
  }

  // extracted model for LIT Element
  static get properties() {
    console.log("LIT PROPERTIES", this.model);

    let props = JSON.parse(JSON.stringify(this.model));

    Object.keys(props).map(function (key: any) {
      let item = props[key];

      if (item.type == "property")
        item.type = "object";
      props[key] = item;
    });

    // Make it conform for lit
    return props;
  }

  async initAsync() { }
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
