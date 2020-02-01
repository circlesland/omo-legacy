import DragableQuant from "./DragableQuant";

export default class CodeEditor extends DragableQuant {
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
            <button @click="${this.saveQuant}"
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Save</button>
        </div>
        `
    }

    public async saveQuant(): Promise<void> {
        await omo.quantum.saveQuant(this.quant, this.editor.code);
        alert("quant uploaded");
    }

    private async loadCode(): Promise<void> {
        if (this.quant === undefined) { return; }
        this.editor.code = await omo.quantum.loadFromThreadByName(this.quant);
    }
}