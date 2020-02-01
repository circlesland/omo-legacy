import DragableQuant from "../../kernel/quants/DragableQuant";

export default class Data extends DragableQuant {
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`Data`;
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
        };
    }
}