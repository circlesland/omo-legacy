import DragableQuant from "../../kernel/quants/DragableQuant";

export default class Actions extends DragableQuant {
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`Actions`;
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
        };
    }
}