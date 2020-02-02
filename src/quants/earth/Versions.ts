import DragableQuant from '../../kernel/quants/DragableQuant';

export default class Versions extends DragableQuant {
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {
      quant: { type: "string" },
      versions: { type: "array" }
    };
  }
  static get styles() {
    return [omo.theme];
  }
  public versions: any;
  public quant: any;
  constructor() {
    super();
    this.autosave = false;
    this.versions = [];
  }
  public render(): void {
    return omo.html`
    
    <div claVersionssl px-8 py-6 bg-gray-200 w-1/5 text-right">
      <p class="mt-8 uppercase text-gray-600 text-xs font-semibold">
        Versions
      </p>
      <ul class="mt-2 overflow-y-scroll">
    
        <li class="px-2 py-2 mb-1">
    
          <p class="font-semibold text-lg text-primary leading-tight truncate">
            LATEST
          </p>
          <p class="text-xs text-gray-600">adsfljhiuasdljkfassdsasdjlfh</p>
          <p class="text-sm text-gray-800">
            my last commit message
          </p>
        </li>
        ${this.versions.map(version => omo.html`
        <li class="px-2 py-2 mb-1 hover:bg-primary hover:rounded-xl hover:text-white">
          <p class="font-semibold text-base leading-tight truncate">
            ${version.versionName} ${omo.moment(version.created).locale(navigator.language.split('-')[0]).calendar()}
          </p>
          <p class="text-xs text-gray-600">${version.code}</p>
          <p class="text-sm text-gray-800">
            ${version.commitMessage}
            ${JSON.stringify(version)}
          </p>
        </li>
        `)}
    
    
    
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
        case "quant": this.loadVersions(); break;
      }
    });
  }
  public async loadVersions(): Promise<void> {
    this.versions = await omo.quantum.versions(this.quant);
    console.log(this.versions);
  }
}
