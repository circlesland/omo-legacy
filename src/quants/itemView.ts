omo.quant(
  class ItemView extends omo.quanta.Quant {
    public quantname: string | undefined;
    public quant: any;

    static get styles() {
      return [
        omo.theme,
        omo.css /*css*/ `
        :host{
        }
        `
      ];
    }

    static get model(): any {
      return {
        quantname: { type: "string" },
        quant: { type: "object" }
      }
    }

    constructor() {
      super();
    }

    public async show(constructor: any, entity: any) {
      console.log(constructor);
      this.quantname = constructor.name;
      let quant = new constructor();
      quant.ID = entity;
      await quant.initAsync()
      console.log(quant.model);
      this.quant = quant;
      console.log(entity);
    }

    public render(): void {
      console.log(this.quant._model);
      return omo.html`
        <h1>
          ${this.quantname}
        </h1>
        <h2>model</h2>
        <ul>
          ${Object.keys(this.quant._model).map(key => omo.html`
          <li>
            <strong>${key}</strong>
            <p>${this.quant[key]}</p>
          </li>`
      )}
        </ul>
        ${JSON.stringify(this.quant.model)}
      `
    }
  }
);