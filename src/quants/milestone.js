omo.quant(
  class Milestone extends omo.quanta.Quant {
    static get styles() {
      return [
        omo.normalize,
        omo.css``
      ];
    }
    constructor() {
      super();
      this.name = "";
      this.lastName = "";
      this.age = 0;
    }

    render() {
      return omo.html`
      <p>Name: ${this.name}</p>
      <p>Nachname: ${this.lastName}</p>
      <p>Alter: ${this.age}</p>
      `;
    }

    static get model() {
      return {
        name: {
          type: "string"
        },
        enddate: {
          type: "date"
        }
      };
    }

    static get properties() {
      return super.properties;
    }
  }
);
