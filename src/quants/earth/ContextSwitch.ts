import DragableQuant from "../../kernel/quants/DragableQuant";

export default class ContextSwitch extends DragableQuant {
    public selectedQuant: any;
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`Context: ${this.selectedQuant}`;
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
            selectedQuant: {
                type: "string"
            }
        };
    }
}