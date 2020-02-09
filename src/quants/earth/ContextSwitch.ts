import DesignerContext from './DesignerContext';

export default class ContextSwitch extends DesignerContext {
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`
        <div class="bg-gray-200 px-4 py-2">
          <h1 class="text-gray-700 font-semibold text-lg">
            <span class="lowercase font-bold"></span>
            ${this.quantName === 'undefined' ? 'quant' : this.quantName}@${
      this.versionName === '' ? 'version' : this.versionName
    }
          </h1>
        </div>
    `;
  }
  static get properties(): any {
    return super.properties;
  }
  static get styles(): any[] {
    return [omo.theme];
  }
}
