import DragableQuant from "../../kernel/quants/DragableQuant";

export default class ViewsChooser extends DragableQuant {
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`Views`;
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
        };
    }
}