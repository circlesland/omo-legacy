import DragableQuant from "../../kernel/quants/DragableQuant";

export default class Designer extends DragableQuant {
    constructor() {
        super();
    }
    public render(): void {
        return omo.html`
        <omo-earth-quantaList></omo-earth-quantaList>
        <omo-earth-contextSwitch></omo-earth-contextSwitch>
        <omo-earth-viewsChooser></omo-earth-viewsChooser>
        <omo-earth-data></omo-earth-data>
        <omo-earth-actions></omo-earth-actions>
        <omo-earth-versions></omo-earth-versions>
        <omo-earth-splitView></omo-earth-splitView>
        `;
    }
    public static get styles() {
        return [omo.css/*css*/`
    :host{
        height:100%;
        display:grid;
          grid-template-areas: 
        "quanta nav views"
        "quanta split views"
        "data split versions"
        "data actions versions";

        grid-template-colums: auto 4fr auto;
        grid-template-rows:auto 1fr 1fr auto;
    }
    omo-earth-quantaList {grid-area:quanta;}
    omo-earth-contextSwitch {grid-area:nav;}
    omo-earth-viewsChooser {grid-area:views;}
    omo-earth-data {grid-area:data;}
    omo-earth-actions {grid-area:actions;}
    omo-earth-versions {grid-area:versions;}
    omo-earth-splitView {grid-area:split;}
    `]
    }
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
        };
    }
}