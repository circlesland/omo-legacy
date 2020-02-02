import DragableQuant from "../../kernel/quants/DragableQuant";

export default class QuantaList extends DragableQuant {
    static get properties(): any {
        return super.properties;
    }
    static get model(): any {
        return {
            quanta: {
                type: "array"
            },
            selectedQuant: {
                type: "string"
            }
        };
    }
    public quanta: any[];
    public selectedQuant: any;
    constructor() {
        super();
        this.autosave = false;
        this.quanta = [];
        this.listenToQuanta();

    }
    public async listenToQuanta(): Promise<void> {
        omo.client.listen(omo.quantum.QuantStoreId, omo.quantum.QuantaModelName, "", this.updateQuanta);
        this.updateQuanta();
    }
    public async updateQuanta(): Promise<void> {
        this.quanta = await omo.quantum.all();
    }
    public render(): void {
        return omo.html`
        ${this.quanta.map((quant: any) => {
        const quantName = omo.quantum.getQuantName(quant.author, quant.project, quant.name, quant.version);
        return omo.html`<a @click="${this.selectQuant}">${quantName}</a>`
        })}`
    }

    public async initAsync(): Promise<void> {
        super.initAsync();
    }
    public selectQuant(event: Event): void {
        // this.selectedQuant = event["path"][0].innerText;
        this.selectedQuant = event.srcElement["innerText"];
    }

    public updated(changedProperties: any): void {
        super.updated(changedProperties);
    }

    static get styles() { return [omo.css`:host{ display: flex; flex-direction: column; } `] }
}