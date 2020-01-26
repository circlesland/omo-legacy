omo.quant(
  class Simple extends omo.quanta.Quant {
    static get styles() {
      return [
        omo.normalize,
        omo.css`
        h1{
          color:blue;
        }`
      ];
    }

    render() {
      return omo.html`
      <h1>${this.name}</h1>
      `;
    }

    static get model() {
      return {
        name: {
          type: "string"
        }
      };
    }

    static get properties() {
      return super.properties;
    }
  }
);
