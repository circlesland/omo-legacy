omo.quant(
  class StoreView extends omo.quanta.Quant {
    active: string;
    static get styles() {
      return [
        omo.theme,
        omo.css /*css*/ `
        :host{
          display:grid !important;
          grid-template-areas:
            "left main right"
            "left footer right";
            grid-template-rows: 1fr auto;
            grid-template-columns: auto 1fr auto;
          height:100%;
        }
        .left{
          grid-area:left;
          display:flex;
          flex-direction:column;
        }
        .right{
          grid-area:right;
          display:flex;
          flex-direction:column;
          justify-self:end;
        }
        omo-table-view{
          grid-area: main;
          justify-self: start;
        }
        footer{
          grid-area: footer;
        }
        `
      ];
    }

    static get model() {
      return {
        active: {
          type: "string"
        }
      }
    }

    static get properties() {
      return super.properties;
    }

    constructor() {
      super();
      this.active = "Demo";
    }

    render() {
      return omo.html`
      <div class="bg-gray-100 left border p-10">
        <h1 class="text-l">STORE</h1>
        ${Object.keys(omo.quanta).map(quant => {
        return omo.html`<a class="py-1 text-gray-600 ${this.active == quant ? 'text-green-400' : ''}"
          @click="${this.quantClicked}">${quant}</a>`;
        })}
      </div>
      <omo-table-view class="p-10" active="${this.active}"></omo-table-view>
      <div class="bg-gray-100 right border p-10">
        <h1 class="text-l text-right">VIEWS</h1>
        <a class="py-1 text-gray-600 text-right">Generic</a>
        <a class="py-1 text-gray-600 text-right">Code</a>
        <h1 class="text-l pt-5 text-right">CUSTOM</h1>
        <a class="py-1 text-gray-600 text-right">Kanban</a>
      </div>
      <footer class="text-center p-1">
        <a class="text-gray-600 text-xs">2020 copyleft by - </a>
        <a class="text-gray-600 text-xs" href="https://github.com/samuelandert" target="_blank">@samuelandert</a>
        <a class="text-gray-600 text-xs" href="https://github.com/phibar" target="_blank">@phibar</a>
      </footer>
      `;
    }

    async initAsync() {
      super.initAsync();
    }

    quantClicked(event: any) {
      this.active = event.target.text;
    }
  }
);