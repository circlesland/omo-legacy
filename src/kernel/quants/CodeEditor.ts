import DragableQuant from "./DragableQuant";

export default class CodeEditor extends DragableQuant {
    public author: any;
    public project: any;
    public name: any;
    public major: any;
    public minor: any;
    public patch: any;
    public static get model(): any {
        return {
            quant: {
                type: 'string'
            }
        }
    }

    static get properties(): any {
        return super.properties;
    }

    static get styles(): any {
        return [omo.theme, omo.css/*css*/`
        :host {
            height:100%;
            width:100%;
            position:relative;
            display:grid;
            grid-template-rows:1fr auto;
        }
        omo-quantum-editor-0.1.0{
            width:50%;
        }
        div{
            display:flex;
            justify-content:flex-end;
            align-items:center;
        }
        `];
    }
    public quant: string | undefined;
    public editor: any;


    constructor() {
        super();
    }

    public firstUpdated(changedProperties): void {
        console.log("TEST")
        super.firstUpdated(changedProperties);
        this.editor = this.root.children[0];
    }

    public updated(changedProperties: any): void {
        super.updated(changedProperties);
        changedProperties.forEach((_oldValue, propName) => {
            switch (propName) {
                case "quant": this.loadCode(); break;
            }
        });
    }

    public render(): void {
        return omo.html`
        <omo-quantum-editor-0.1.0 theme="monokai" mode="javascript"></omo-quantum-editor-0.1.0>
        <div class="actions p-1">
            <input type="text" .value="${this.author}" name="author">
            <input type="text" .value="${this.project}" name="project">
            <input type="text" .value="${this.name}" name="name">
            <input type="number" .value="${this.major}" name="major">
            <input type="number" .value="${this.minor}" name="minor">
            <input type="number" .value="${this.patch}" name="patch">
            <button @click="${this.saveQuant}"
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Save</button>
        </div>
        `
    }

    public async saveQuant(): Promise<void> {
        const author = this.root.querySelector(`input[name="author"]`)["value"];
        const project = this.root.querySelector(`input[name="project"]`)["value"];
        const name = this.root.querySelector(`input[name="name"]`)["value"];
        const major = Number.parseInt(this.root.querySelector(`input[name="major"]`)["value"], 10);
        const minor = Number.parseInt(this.root.querySelector(`input[name="minor"]`)["value"], 10);
        const patch = Number.parseInt(this.root.querySelector(`input[name="patch"]`)["value"], 10);

        await omo.quantum.saveQuant(author, project, name, major, minor, patch, this.editor.code);
        alert("quant uploaded");
    }

    private async loadCode(): Promise<void> {
        if (this.quant === undefined) { return; }
        const meta = omo.quantum.getMeta(this.quant);
        this.author = meta.author;
        this.project = meta.project;
        this.name = meta.name;
        this.major = meta.major;
        this.minor = meta.minor;
        this.patch = meta.patch;
        this.editor.code = await omo.quantum.loadFromThreadByName(this.quant);
    }
}