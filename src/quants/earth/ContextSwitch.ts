import DragableQuant from '../../kernel/quants/DragableQuant';

export default class ContextSwitch extends DragableQuant {
  public selectedQuant: any;
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`
        <div class="bg-gray-100 px-4 py-2">
          <h1 class="text-gray-700 font-semibold text-lg"><span class="lowercase font-bold">context:
            </span></span>${this.selectedQuant}</h1>
        </div>
    `;
  }
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {
      selectedQuant: {
        type: 'string'
      }
    };
  }
  static get styles(): any[] {
    return [omo.theme];
  }
}
