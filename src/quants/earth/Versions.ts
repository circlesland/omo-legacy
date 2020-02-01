import DragableQuant from "../../kernel/quants/DragableQuant";

export default class Versions extends DragableQuant {
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`Versions`;
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
        };
    }
}