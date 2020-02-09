export default class Action {
  public Display: string;
  public Type: ActionType;
  // tslint:disable-next-line: ban-types
  public CallBack: any;
}

export enum ActionType {
  Method,
  Popup
}
