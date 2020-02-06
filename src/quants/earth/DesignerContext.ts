import DragableQuant from '../../kernel/quants/DragableQuant';

export default class DesignerContext extends DragableQuant {
  public availableViews: any[];
  public quantName: string | undefined;
  public quanta: any[];
  public selectedViews: any[];
  public versionId: string | undefined;
  public versionName: string | undefined;
  public versionHash: string | undefined;

  constructor() {
    super();
    this.quanta = [];
    this.availableViews = [];
    this.selectedViews = [];
  }

  public async initAsync(): Promise<void> {
    this.listenToQuanta();
    this.quanta = await omo.quantum.all();
  }

  static get properties(): any {
    return super.properties;
  }

  static get model(): any {
    return {
      availableViews: {
        type: 'object'
      },
      quantName: {
        type: 'string'
      },
      quanta: {
        type: 'array'
      },
      selectedViews: {
        type: 'array'
      },
      versionHash: {
        type: 'string'
      },
      versionName: {
        type: 'string'
      }
    };
  }

  public listenToQuanta(): void {
    omo.client.listen(
      omo.quantum.QuantStoreId,
      omo.quantum.QuantaModelName,
      '',
      async () => (this.quanta = await omo.quantum.all())
    );
  }
}
