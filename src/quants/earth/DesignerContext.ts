import DragableQuant from "../../kernel/quants/DragableQuant";

export default class DesignerContext extends DragableQuant {
    public quantName: string | undefined;
    public quanta: any[];

    constructor() {
        super();
        this.quanta = []
    }

    public async initAsync(): Promise<void> {
        this.listenToQuanta();
        this.quanta = await omo.quantum.all()
    }

    static get properties(): any {
        return super.properties;
    }

    static get model(): any {
        return {
            quantName: {
                type: "string"
            },
            quanta: {
                type: "array"
            }
        };
    }

    public listenToQuanta(): void {
        omo.client.listen(
            omo.quantum.QuantStoreId,
            omo.quantum.QuantaModelName,
            '', async () => this.quanta = await omo.quantum.all()
        )
    };
}
