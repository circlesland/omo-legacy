import DragableQuant from "../../kernel/quants/DragableQuant";

export default class ContextSwitch extends DragableQuant {
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`ContextSwitch`;
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
        };
    }
}