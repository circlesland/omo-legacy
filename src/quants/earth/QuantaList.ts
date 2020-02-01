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
        omo.client.listen(omo.quantum.QuantStoreId, await omo.quantum.QuantModelName(), "", this.updateQuanta);
        this.updateQuanta();
    }
    public async updateQuanta(): Promise<void> {
        this.quanta = (await omo.client.modelFind(omo.quantum.QuantStoreId, await omo.quantum.QuantModelName(), {})).entitiesList;
    }
    public render(): void {
        return omo.html`
        ${this.quanta.map((quant: any) => {
            const quantName = omo.quantum.getQuantName(quant.author, quant.project, quant.name, quant.major, quant.minor,
                quant.patch);
            return omo.html`<a @click="${this.selectQuant}">${quantName}</a>`
        })}`
    }

    public async initAsync(): Promise<void> {
        super.initAsync();
    }
    public selectQuant(event: Event): void {
        this.selectedQuant = event["path"][0].innerText;
    }

    public updated(changedProperties: any): void {
        super.updated(changedProperties);
    }

    static get styles() { return [omo.css`:host{ display: flex; flex-direction: column; } `] }
}