import { Ace } from "../../types/ace";
import DragableQuant from "./DragableQuant";

export default class Editor extends DragableQuant {
    public static get model(): any {
        return {
            code: {
                type: "string"
            },
            mode: {
                type: "string"
            },
            theme: {
                type: "string"
            }
        }
    }

    static get properties(): any {
        return super.properties;
    }

    static get styles(): any {
        return [omo.theme, omo.css`:host{height:100%;width:100%;position:relative;} #editor{position:absolute;width:100%;height:100%;top:0;left:0;}`];
    }

    public mode: any;
    public code: any;
    public theme: any;
    private editor: Ace.Editor;

    constructor() {
        super();
        if (this.mode === undefined) { this.mode = "javascript"; }
        if (this.code === undefined) { this.code = ""; }
    }
    public updated(changedProperties: any): void {
        super.updated(changedProperties);
        changedProperties.forEach((_oldValue, propName) => {
            switch (propName) {
                case "theme": if (this.theme !== undefined) {
                    this.editor.setTheme(`ace/theme/${this.theme}`);
                } break;
                case "mode": if (this.mode !== undefined) {
                    this.editor.setTheme(`ace/mode/${this.mode}`);
                } break;
                case "code": if (this.code) {
                    this.editor.setValue(this.code);
                } break;
            }
        });
    }


    public firstUpdated(): void {
        this.initEditor();
    }

    public render(): void {
        return omo.html`<div id="editor"></div>`
    }
    public editorChanged(delta: Ace.Delta): void {
        console.log(delta);
    }

    private async initEditor(): Promise<void> {
        await this.LoadAceJs();
        const elem = this.root.getElementById("editor");
        await this.setupAceJs(elem);
        this.configureEditor(elem);
    }

    private configureEditor(elem: HTMLElement): void {
        this.editor = ace.edit(elem);
        if (this.code !== undefined) {
            this.editor.setValue(this.code);
        }
        if (this.theme !== undefined) {
            this.editor.setTheme(`ace/theme${this.theme}`);
        }
        if (this.mode !== undefined) {
            this.editor.session.setMode(`ace/mode/${this.mode}`);
        }
        this.editor.on('change', (delta: Ace.Delta) => this.editorChanged(delta));
        this.editor.commands.addCommand({
            bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
            exec: () => { this.code = this.editor.getValue(); this.saveModel(); alert("quant saved"); },
            name: 'myCommand',
            readOnly: true // false if this command should not apply in readOnly mode
        });
        this.editor.commands.addCommand({
            bindKey: { win: 'Ctrl-1', mac: 'Command-1' },
            exec: () => { this.theme = "monokai"; },
            name: 'myCommand2',
            readOnly: true // false if this command should not apply in readOnly mode
        });
        this.editor.commands.addCommand({
            bindKey: { win: 'Ctrl-2', mac: 'Command-2' },
            exec: () => { this.theme = "github"; },
            name: 'myCommand3',
            readOnly: true // false if this command should not apply in readOnly mode
        });
    }

    private async setupAceJs(elem: HTMLElement): Promise<void> {
        ace.config.set("parent", elem.parentElement);
        const hashes = (await omo.ipfs.cat(ace.HASHES)).toString();
        ace.config.set("hashes", JSON.parse(hashes));
        ace.config.set("ipfs", omo.ipfs);
    }

    private async LoadAceJs(): Promise<void> {
        const aceJs = (await omo.ipfs.cat("QmXmdgpYpvkv5WKzCT6ujvR8tA17F3pWVmYzkXfWjYCbLx")).toString();
        const script = document.createElement("script");
        script.append(document.createTextNode(aceJs));
        const head = document.getElementsByTagName("head")[0];
        head.append(script);
    }
}