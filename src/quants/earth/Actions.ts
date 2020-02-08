import DesignerContext from './DesignerContext';

export default class Actions extends DesignerContext {
  constructor() {
    super();
  }
  public render(): void {
    // tslint:disable: no-eval

    return omo.html`
      <div class="bg-gray-100 px-4 py-2">
        ${this.actions.map(action => omo.html`
        <button @click="${action.CallBack}"
          class="px-4 py-2 border-2 text-green-400 border-green-400 rounded-sm hover:bg-green-400 uppercase font-semibold">${action.Display}</button>
        `)}
      </div>
    `;
  }
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {};
  }
  static get styles(): any[] {
    return [omo.theme];
  }
}
