// tslint:disable: object-literal-sort-keys
omo.quant(
  class Todo extends omo.quanta.Quant {
    public done: boolean;
    public task: string;
    static get styles(): any {
      return [
        omo.normalize,
        omo.css`
        h1{
          color:blue;
        }`
      ];
    }
    constructor() {
      super();
      this.done = false;
      this.task = '';
    }

    public render(): any {
      return omo.html`
      <input type="checkbox" ?checked="${this.done}" disabled>
      <p>Task: ${this.task}</p>
      <p>von ${this.person}</p>
      `;
    }

    static get model(): any {
      return {
        state: {
          type: 'relation',
          quant: omo.quanta.State,
          display: 'state',
          kanban: true
        },
        task: {
          type: 'string',
          required: true
        },
        person: {
          type: 'relation',
          quant: omo.quanta.Person,
          display: 'name'
        },
        milestone: {
          type: 'relation',
          quant: omo.quanta.Milestone,
          display: 'name'
        }
      };
    }

    static get properties(): any {
      return super.properties;
    }
  }
);
