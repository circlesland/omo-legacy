omo.quant(
  class Person extends omo.quanta.Quant {
    public name: string;
    public lastName: string;
    public age: number;
    public displayName: string;
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
      this.displayName = "${this.name} ${this.lastName}";
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
        lastName: {
          type: "string"
        },
        age: {
          type: "number"
        },
        email: {
          type: "email"
        },
        displayName: {
          type: "formular"
        }
      };
    }

    static get properties() {
      return super.properties;
    }
  }
);
