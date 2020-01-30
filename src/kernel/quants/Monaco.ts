// tslint:disable-next-line: no-submodule-imports
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import DragableQuant from "./DragableQuant";

export default class Monaco extends DragableQuant {


    public code: string;


    constructor() {
        super();
        this.code = "";
        const div = document.createElement("div");
        div.style.height = "100%";
        div.style.width = "100%";
        div.style.backgroundColor = "red";
        this.append(div);
        monaco.editor.create(
            div,
            {
                language: 'javascript',
                theme: 'vs-dark',
                value: `const foo = () => 0;`
            }
        );
    }
    public render(): void {
        return omo.html`Monaco CORE: ${this.code} <slot></slot>`
    }
    public static get model(): any {
        return {
            code: {
                type: "string"
            }
        }
    }
}