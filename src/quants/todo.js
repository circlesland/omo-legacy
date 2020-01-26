omo.quant(
  class Todo extends omo.quanta.Quant {
    static get styles() {
      return [
        omo.normalize,
        omo.css `
        h1{
          color:blue;
        }`
      ];
    }
    constructor() {
      super();
      this.done = false;
      this.task = "";
    }

    render() {
      return omo.html `
      <input type="checkbox" ?checked="${this.done}" disabled>
      <p>Task: ${this.task}</p>
      <p>von ${this.person}</p>
      `;
    }

    static get model() {
      return {
        done: {
          type: "boolean"
        },
        task: {
          type: "string",
          required: true
        },
        person: {
          type: "relation",
          quant: omo.quanta.Person,
          display: "name",
        },
        milestone: {
          type: "relation",
          quant: omo.quanta.Milestone,
          display: "name"
        }
      };
    }

    static get properties() {
      return super.properties;
    }
  }
);