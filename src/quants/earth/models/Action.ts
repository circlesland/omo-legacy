export default class Action {
    public Display: string;
    public Type: ActionType;
}

export enum ActionType {
    Method,
    Popup
}