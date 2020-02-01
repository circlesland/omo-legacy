import DragableQuant from '../../kernel/quants/DragableQuant';

export default class QuantaList extends DragableQuant {
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {
      quanta: {
        type: 'array'
      },
      selectedQuant: {
        type: 'string'
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
    omo.client.listen(
      omo.quantum.QuantStoreId,
      await omo.quantum.QuantModelName(),
      '',
      this.updateQuanta
    );
    this.updateQuanta();
  }
  public async updateQuanta(): Promise<void> {
    this.quanta = (
      await omo.client.modelFind(
        omo.quantum.QuantStoreId,
        await omo.quantum.QuantModelName(),
        {}
      )
    ).entitiesList;
  }
  public render(): void {
    return omo.html`
        <div class="h-full px-8 py-6 bg-gray-200 w-1/5">
            <p class="uppercase text-gray-600 text-xs font-semibold">Quanta</p>
            <ul class="">
                ${this.quanta.map((quant: any) => {
                  const quantName = omo.quantum.getQuantName(
                    quant.author,
                    quant.project,
                    quant.name,
                    quant.major,
                    quant.minor,
                    quant.patch
                  );
                  return omo.html`         
                    <li @click="${this.selectQuant}" class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate">${quantName}</li>
                `;
                })}
            </ul>
        </div>
        `;
  }

  public async initAsync(): Promise<void> {
    super.initAsync();
  }
  public selectQuant(event: Event): void {
    this.selectedQuant = event.srcElement['innerText'];
  }

  public updated(changedProperties: any): void {
    super.updated(changedProperties);
  }

  static get styles() {
    return [omo.theme];
  }
}
