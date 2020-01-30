// import DataInterface from './DataInterface';
import Quant from './Quant';

export default class DragableQuant extends Quant {
  public async initAsync(): Promise<void> {

    await super.initAsync();
  }
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return super.model;
  }
}
