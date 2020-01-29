omo.quant(
  class State extends omo.quanta.Quant {
    done: boolean;
    task: string;
    static get styles() {
      return [
        omo.normalize,
        omo.css``
      ];
    }
    constructor() {
      super();
      this.done = false;
      this.task = "";
    }

    render() {
      return omo.html`
TODO
          `;
    }

    static get model() {
      return {
        state: {
          type: "string"
        }
      };
    }

    static get properties() {
      return super.properties;
    }
  }
);