import DesignerContext from './DesignerContext';
import Version from './models/version';

export default class Versions extends DesignerContext {
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {
      latestVersion: { type: 'string' },
      versions: { type: 'array' }
    };
  }
  static get styles(): any[] {
    return [omo.theme];
  }

  public versions: Version[];
  public latestVersion: Version;

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
        ${this.versions.map(version => {
          const latest =
            version.ID === this.latestVersion.ID
              ? omo.html`<p class="font-semibold text-lg text-primary leading-tight truncate uppercase">latest</p>`
              : ``;
          const active =
            version.ID === this.versionId ? 'bg-primary text-white' : '';
          return omo.html`
            <li @click="${() => {
              this.selectVersion(
                version.ID,
                version.versionName,
                version.created,
                version.code
              );
            }}" class="px-2 py-2 mb-1 hover--bg-primary hover--rounded-xl hover--text-white ${active}">
              ${latest}
              <p class="font-semibold text-base leading-tight truncate">${
                version.versionName === ''
                  ? version.created
                  : version.versionName
              }</p>
              <p class="text-xs text-gray-600 truncate" > ${omo
                .moment(version.created)
                .locale(this.language)
                .calendar()}
              </p>
              <p class="text-xs text-gray-600 truncate" > ${version.code} </p>
              <p class="text-sm text-gray-800" >${version.commitMessage}</p>
            </li>
        `;
        })}
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
        case 'versionHash':
        case 'quantName':
          this.UpdateVersion();
          break;
      }
    });
  }

  public async UpdateVersion(): Promise<void> {
    this.versions =
      this.quantName !== undefined
        ? await omo.quantum.versions(this.quantName)
        : [];
    this.latestVersion =
      this.versions.length > 0 ? this.versions[0] : undefined;
  }

  public selectVersion(
    versionId: string,
    versionName: string,
    versionCreated: number,
    versionHash: string
  ): void {
    this.versionName =
      versionName !== '' ? versionName : versionCreated.toString();
    this.versionId = versionId;
    this.versionHash = versionHash;
    this.dispatchEvent(new CustomEvent('versionSelected'));
  }
}
