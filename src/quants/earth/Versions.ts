import DesignerContext from './DesignerContext';

export default class Versions extends DesignerContext {
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {
      versions: { type: 'array' }
    };
  }
  static get styles() {
    return [omo.theme];
  }
  public versions: any;
  constructor() {
    super();
    this.autosave = false;
    this.versions = [];
  }
  public render(): void {
    return omo.html`
    
    <div class="h-full px-8 py-6 bg-gray-200 w-1/5 text-right">
      <p class=" mt-8 uppercase text-gray-600 text-xs font-semibold">Versions</p>
      <ul class="mt-2 h-full overflow-scroll">
        <li class="px-2 py-2 mb-1">
          <p class="font-semibold text-lg text-primary leading-tight truncate">
            LATEST
          </p>
        </li>
        ${this.versions.map(version => omo.html`
        <li class="px-2 py-2 mb-1 hover--bg-primary hover--rounded-xl hover:text-white">
          <p class="font-semibold text-base leading-tight truncate">${version.versionName}</p>
          <p class="text-xs text-gray-600 truncate">${omo.moment(version.created)
        .locale(this.language).calendar()}
          </p>
          <p class="text-xs text-gray-600 truncate">${version.code}</p>
          <p class="text-sm text-gray-800">
            ${version.commitMessage}
          </p>
        </li>
        `
    )}
    
    
    
      </ul>
    </div>
    `;
  }
  public async initAsync(): Promise<void> {
    super.initAsync();
  }

  public updated(changedProperties: any): void {
    super.updated(changedProperties);
    changedProperties.forEach((_oldValue, propName) => {
      switch (propName) {
        case 'quantName': this.loadCodeVersionsForQuant(); break;
      }
    });
  }
  public async loadCodeVersionsForQuant(): Promise<void> {
    this.versions = this.quantName !== undefined ? await omo.quantum.versions(this.quantName) : [];
  }
}
