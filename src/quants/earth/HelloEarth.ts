import DragableQuant from '../../kernel/quants/DragableQuant';

export default class Designer extends DragableQuant {
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`Hello omo.earth`;
  }
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {};
  }
}
