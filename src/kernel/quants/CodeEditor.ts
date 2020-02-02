import DragableQuant from './DragableQuant';

export default class CodeEditor extends DragableQuant {
  public author: any;
  public project: any;
  public name: any;
  public version: any;
  public static get model(): any {
    return {
      name: {
        type: 'string'
      },
      project: {
        type: 'string'
      },
      quant: {
        type: 'string'
      },
      version: {
        type: 'string'
      }
    };
  }

  static get properties(): any {
    return super.properties;
  }

  static get styles(): any {
    return [
      omo.theme,
      omo.css/*css*/ `
        :host {
            height:100%;
            width:100%;
            position:relative;
            display:grid;
            grid-template-rows:1fr auto;
            grid-template-columns: minmax(0, 1fr);
        }
        div{
            display:flex;
            justify-content:flex-end;
            align-items:center;
        }
        `
    ];
  }
  public quant: string | undefined;
  public editor: any;

  constructor() {
    super();
  }

  public firstUpdated(changedProperties): void {
    super.firstUpdated(changedProperties);
    this.editor = this.root.children[0];
  }

  public updated(changedProperties: any): void {
    super.updated(changedProperties);
    changedProperties.forEach((_oldValue, propName) => {
      switch (propName) {
        case 'quant':
          this.loadCode();
          break;
      }
    });
  }

  public render(): void {
    return omo.html`
        <omo-earth-editor theme="monokai" mode="javascript"></omo-earth-editor>
        <div class="actions p-1">
          <input type="text" .value="${this.author}" name="author">
          <input type="text" .value="${this.project}" name="project">
          <input type="text" .value="${this.name}" name="name">
          <input type="text" placeholder="version name" name="version">
          <input type="text" placeholder="commit message" name="commitMessage">
          <button @click="${this.saveQuant}"
            class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Save</button>
        </div>
        `;
  }

  public async saveQuant(): Promise<void> {
    console.log('before save');
    const author = this.root.querySelector(`input[name="author"]`)['value'];
    const project = this.root.querySelector(`input[name="project"]`)['value'];
    const name = this.root.querySelector(`input[name="name"]`)['value'];
    const version = this.root.querySelector(`input[name="version"]`)['value'];
    const commitMessage = this.root.querySelector(
      `input[name="commitMessage"]`
    )['value'];

    await omo.quantum.saveQuant(
      author,
      project,
      name,
      version,
      this.editor.code,
      commitMessage
    );
    alert('quant uploaded');
  }

  private async loadCode(): Promise<void> {
    if (this.quant === undefined) {
      return;
    }
    const meta = omo.quantum.getMeta(this.quant);
    this.author = meta.author;
    this.project = meta.project;
    this.name = meta.name;
    this.version = meta.version;
    await this.editor.initAsync();
    this.editor.code = await omo.quantum.loadFromThreadByName(this.quant);
  }
}
