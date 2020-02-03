import QuantLoadedEvent from '../../kernel/events/QuantLoadedEvent';
// import ContextSwitch from './ContextSwitch';
import DesignerContext from './DesignerContext';
import QuantaList from './QuantaList';
// import QuantaList from './QuantaList';
// import SplitView from './SplitView';
import Versions from './Versions';
import ViewsChooser from './ViewsChooser';

export default class Designer extends DesignerContext {
  // private contextSwitch: ContextSwitch;
  // private splitView: SplitView;
  private versions: Versions;
  private quantaList: QuantaList;
  private viewsChooser: ViewsChooser;

  constructor() {
    super();
    this.autosave = false;
    document.addEventListener(
      QuantLoadedEvent.LOADED,
      this.quantLoaded.bind(this)
    );
  }

  public render(): void {
    return omo.html`
        <omo-earth-quantaList quantName="${this.quantName}"></omo-earth-quantaList>
        <omo-earth-contextSwitch quantName="${this.quantName}" versionName="${this.versionName}"></omo-earth-contextSwitch>
        <omo-earth-viewsChooser></omo-earth-viewsChooser>
        <omo-earth-data></omo-earth-data>
        <omo-earth-actions></omo-earth-actions>
        <omo-earth-versions quantName="${this.quantName}" versionHash="${this.versionId}" versionName="${this.versionName}">
        </omo-earth-versions>
        <omo-earth-splitView></omo-earth-splitView>
    `;
  }

  public firstUpdated(changedProperties: any): void {
    super.firstUpdated(changedProperties);
    this.quantaList = this.root.querySelector('omo-earth-quantalist');
    // this.contextSwitch = this.root.querySelector('omo-earth-contextswitch');
    // this.splitView = this.root.querySelector('omo-earth-splitView');
    this.versions = this.root.querySelector('omo-earth-versions');
    this.viewsChooser = this.root.querySelector('omo-earth-viewschooser');
    this.quantaList.addEventListener(
      'quantSelected',
      this.quantSelected.bind(this),
      false
    );
    this.versions.addEventListener(
      'versionSelected',
      this.versionSelected.bind(this),
      false
    );
  }

  private quantSelected(): void {
    this.quantName = this.quantaList.quantName;
    this.updateAvailableViews();
  }

  private updateAvailableViews(): void {
    this.availableViews =
      this.quantName !== undefined
        ? [
            { display: 'Code', view: 'omo-earth-codeeditor' },
            { display: 'Preview', view: 'default' }
          ]
        : [];
    this.selectedViews = ['omo-earth-codeeditor'];
    this.viewsChooser.availableViews = this.availableViews;
    this.viewsChooser.selectedViews = this.selectedViews;
  }

  private versionSelected(): void {
    this.versionId = this.versions.versionId;
    this.versionName = this.versions.versionName;
  }

  // private async setSelectedQuant(selectedQuant: any): Promise<void> {
  //   console.debug("Quant selected")

  //   const quant = await omo.quantum.loadQuant(selectedQuant);
  //   if (quant !== undefined) {
  //     this.updateView(quant, selectedQuant);
  //   }
  // }

  private async quantLoaded(_event: QuantLoadedEvent): Promise<void> {
    // console.debug("quant loaded", event);
    // const selectedQuant = event.QuantName;
    // const constructor = omo.quantum.getByName(selectedQuant);
    // this.updateView(constructor, selectedQuant)
  }

  // private async updateView(constructor: any, selectedQuant: string): Promise<void> {
  // const instance = new constructor();

  // this.contextSwitch.selectedQuant = selectedQuant;
  // // this.splitView.setColumns(1);
  // this.splitView.clear();
  // this.splitView.setColumns(1)
  // this.splitView.setRows(2);
  // instance.slot = 'slot-0-0';
  // if (instance['initAsync']) {
  //   await instance.initAsync();
  // }

  // this.splitView.append(instance);
  // const codeEditorCtor = omo.quantum.getByName('omo-earth-codeEditor');
  // const codeEditor = new codeEditorCtor();
  // await codeEditor.initAsync();
  // codeEditor.quant = selectedQuant;
  // codeEditor.slot = 'slot-1-0';
  // this.splitView.append(codeEditor);

  // }

  public static get styles(): any {
    return [
      omo.theme,
      omo.css/*css*/ `
      :host{
        height: 100%;
        display: grid;
        grid-template-areas: 
          "quanta nav views"
          "quanta split views"
          "data split versions"
          "data actions versions";
        grid-template-columns: 16rem minmax(0, 1fr) 16rem;
        grid-template-rows: auto auto 1fr auto;
      }

      omo-earth-data {grid-area:data;}
      omo-earth-actions {grid-area:actions;}
      omo-earth-versions {grid-area:versions;}
      omo-earth-splitview {grid-area:split;}
      omo-earth-quantalist {grid-area:quanta;}
      omo-earth-viewschooser {grid-area:views;}
      omo-earth-contextswitch {grid-area:nav;}`
    ];
  }

  static get model(): any {
    return {
      quantName: {
        type: 'string'
      }
    };
  }
}
