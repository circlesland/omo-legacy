import DragableQuant from "../../kernel/quants/DragableQuant";

export default class QuantaList extends DragableQuant {
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`QuantaList`;
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
        };
    }
}