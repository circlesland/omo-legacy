import QuantLoadedEvent from '../../kernel/events/QuantLoadedEvent';
import DesignerContext from './DesignerContext';
// import { ActionType } from './models/Action';
import QuantaList from './QuantaList';
import SplitView from './SplitView';
import Versions from './Versions';
import ViewsChooser from './ViewsChooser';
export default class Designer extends DesignerContext {
  private splitView: SplitView;
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
    // this.actions = [{ Display: 'new', Type: ActionType.Method , }];
  }

  public render(): void {
    return omo.html`   
        <div class="nerdstatus"></div>
        <header class="w-100 bg-gray-200">
        <button class="px-3 hover:bg-green-400 uppercase font-semibold" @click="${() =>
          this.toggleClass('toggleLeft')}">
          
          <svg width="18px" height="15px" viewBox="0 0 18 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="align-left" class="h-5 w-5 fill-current text-gray-600 hover:text-green-400"  fill-rule="nonzero">
                      <path d="M0,0 L18,0 L18,3 L0,3 L0,0 Z M0,6 L18,6 L18,9 L0,9 L0,6 Z M0,12 L12,12 L12,15 L0,15 L0,12 Z" id="Shape"></path>
                  </g>
              </g>
          </svg>

          </button>
          <omo-earth-contextSwitch quantName="${this.quantName}" versionName="${
      this.versionName
    }"></omo-earth-contextSwitch>
      <button class="px-2 hover:bg-green-400 uppercase font-semibold" @click="${() =>
        this.toggleClass('toggleRight')}">
        <svg width="18px" height="15px" viewBox="0 0 18 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="align-left" class="h-5 w-5 fill-current text-gray-600 hover:text-green-400"  fill-rule="nonzero">
                  <path d="M0,0 L18,0 L18,3 L0,3 L0,0 Z M0,6 L18,6 L18,9 L0,9 L0,6 Z M6,12 L18,12 L18,15 L6,15 L6,12 Z" id="Shape"></path>
              </g>
          </g>
        </svg>
      </button>
      </header> 
        
        <nav>
          <div class="navtop px-8 py-6 bg-gray-100">
            <omo-earth-quantaList quantName="${
              this.quantName
            }"></omo-earth-quantaList>
          </div>
          <div class="navbottom px-8 py-6 bg-gray-100">
            </omo-earth-quantaList>
            <omo-earth-data></omo-earth-data>
          </div>
        </nav>

        <main>
         <omo-earth-splitView quantName="${this.quantName}" versionHash="${
      this.versionHash
    }" availableViews="${JSON.stringify(
      this.availableViews
    )}" selectedViews="${JSON.stringify(this.selectedViews)}">
          </omo-earth-splitView> 
        </main>

        <aside>
          <div class="asidetop px-8 py-6 bg-gray-100">
            <omo-earth-viewsChooser availableViews="${JSON.stringify(
              this.availableViews
            )}" selectedViews="${JSON.stringify(this.selectedViews)}">
            </omo-earth-viewsChooser>
          </div> 
          <div class="asidebottom px-8 py-6 bg-gray-100">
            <omo-earth-versions quantName="${this.quantName}" versionHash="${
      this.versionId
    }" versionName="${this.versionName}">
            </omo-earth-versions>
          </div>
        </aside>

        <footer class="bg-gray-200 p-2">
          <omo-earth-actions actions="${JSON.stringify(
            this.actions
          )}"></omo-earth-actions>
        </footer>
    `;
  }

  public static get styles(): any {
    return [
      omo.theme,
      omo.css/*css*/ `
      :host {
        display: grid;
        grid-template-areas:
          "status status status"
          "context context context"
          "nav main aside"
          "footer footer footer";
        grid-template-columns: 0px 1fr 0px;
        grid-template-rows: 4px auto 1fr auto;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }     
      .nerdstatus {
        background: #cd2626;
        grid-area: status; 
      }
      
      header { grid-area: context; 
        display: flex;
        justify-content: space-between;
      }
      nav { 
        grid-area: nav; 
        overflow: hidden;
        display: grid;
        grid-template-areas:
          "navtop"
          "navbottom";
        grid-template-rows: 50% 50%;
      }
      .navtop {
        grid-area: navtop;
        overflow-y: scroll;
      }
      .navbottom {
        grid-area: navbottom;
        overflow-y: scroll;
      }
      main { grid-area: main; }
      aside { 
        grid-area: aside; 
        overflow: hidden;
        display: grid;
        grid-template-areas:
          "asidetop"
          "asidebottom";
        grid-template-rows: 50% 50%;
      }
      .asidetop {
        grid-area: asidetop;
        overflow-y: scroll;
      }
      .asidebottom {
        grid-area: asidebottom;
        overflow-y: scroll;
      }
      footer { grid-area: footer; }

      :host(.toggleLeft){
        grid-template-columns: 1fr 0px 0px;
      }

      :host(.toggleRight){
          grid-template-columns: 0px 0px 1fr;
      }

      :host(.toggleRight.toggleLeft){
          grid-template-columns: 0px 1fr 0px;
        
      }

      @media(min-width:768px){
        :host{
          grid-template-columns: 0px 1fr 250px;
        }
        
        :host(.toggleLeft) {
          grid-template-columns: 250px 1fr 0px;
        }
        
        :host(.toggleRight){
          grid-template-columns: 0px 1fr 0px;
        }
      }

      @media(min-width:1200px){
        :host{
          grid-template-columns: 250px 1fr 250px;
        }
        :host(.toggleRight){
          grid-template-columns: 250px 1fr 0px;
        }
        :host(.toggleLeft){
          grid-template-columns: 0px 1fr 250px;
        }
        :host(.toggleLeft.toggleRight) {
          grid-template-columns: 0px 1fr 0px;
        }    
      }
      
      /*omo-earth-quantalist {grid-area:nav;}
      omo-earth-data {grid-area:nav;}
      omo-earth-actions {grid-area:actions;}
      omo-earth-viewschooser {grid-area:aside;}
      omo-earth-versions {grid-area:aside;}
      omo-earth-splitview {grid-area:main;}
      omo-earth-contextswitch {grid-area:context;}*/
      `
    ];
  }

  toggleClass(toggle) {
    if (this.classList.contains(toggle)) {
      this.classList.remove(toggle);
    } else {
      this.classList.add(toggle);
    }
  }

  public firstUpdated(changedProperties: any): void {
    super.firstUpdated(changedProperties);
    this.quantaList = this.root.querySelector('omo-earth-quantalist');
    this.versions = this.root.querySelector('omo-earth-versions');
    this.viewsChooser = this.root.querySelector('omo-earth-viewschooser');
    this.splitView = this.root.querySelector('omo-earth-splitview');
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
    this.viewsChooser.addEventListener(
      'selectedViewsChanged',
      this.selectedViewsChanged.bind(this),
      false
    );
    this.splitView.addEventListener(
      'quantSaved',
      this.quantSaved.bind(this),
      false
    );
  }

  private quantSaved(): void {
    // TODO update whole view
    this.quantSelected();
  }

  private quantSelected(): void {
    this.quantName = this.quantaList.quantName;
    this.versionName = 'latest';
    this.versionHash = undefined;
    this.availableViews = [
      {
        display: 'Code',
        properties: {
          hash: 'versionHash',
          quant: 'quantName',
          version: 'versionName'
        },
        view: 'omo-earth-codeeditor'
      },
      {
        display: 'Default',
        properties: {},
        view: 'default'
      }
    ];
    this.selectedViews = ['omo-earth-codeeditor'];
    // this.actions = [
    //   { Display: 'new', Type: ActionType.Method },
    //   { Display: 'delete', Type: ActionType.Method },
    //   { Display: 'save', Type: ActionType.Method }
    // ];
  }

  private versionSelected(): void {
    this.versionId = this.versions.versionId;
    this.versionName = this.versions.versionName;
    this.versionHash = this.versions.versionHash;
  }

  private selectedViewsChanged(): void {
    this.selectedViews = this.viewsChooser.selectedViews;
  }

  // private updateSelectedViews(): void {
  //   this.viewsChooser.selectedViews = this.selectedViews;
  //   this.splitView.selectedViews = this.selectedViews;

  //   this.splitView.clear();
  //   this.selectedViews.forEach(view => {
  //     const viewProperties = this.availableViews.filter(x => x.view === view)[0]
  //       .properties;
  //     const newElem: HTMLElement =
  //       view === 'default'
  //         ? document.createElement(this.quantName)
  //         : document.createElement(view);
  //     newElem.slot = view;
  //     if (viewProperties) {
  //       Object.keys(viewProperties).forEach(key =>
  //         newElem.setAttribute(key, this[viewProperties[key]])
  //       );
  //     }
  //     this.splitView.append(newElem);
  //   });
  // }

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
}
