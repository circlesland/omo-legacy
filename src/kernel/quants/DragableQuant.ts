import DataInterface from "./DataInterface";

export default class DragableQuant extends DataInterface {
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
