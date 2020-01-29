omo.quant(
  class Milestone extends omo.quanta.Quant {
    public name: string;
    public lastName: string;
    public age: number;

    static get styles(): any[] {
      return [omo.normalize, omo.css``];
    }
    constructor() {
      super();
      this.name = '';
      this.lastName = '';
      this.age = 0;
    }

    public render(): void {
      return omo.html`
      <p>Name: ${this.name}</p>
      <p>Nachname: ${this.lastName}</p>
      <p>Alter: ${this.age}</p>
      `;
    }

    // tslint:disable: object-literal-sort-keys
    static get model(): any {
      return {
        name: {
          type: 'string'
        },
        enddate: {
          type: 'date'
        }
      };
    }

    static get properties(): any {
      return super.properties;
    }
  }
);
