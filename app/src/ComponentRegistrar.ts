export type Action = { name: string, title:string, action: () => void };

export class Registrar {
  private _schemaToActionMap: Map<string, Action[]> = new Map();
  private _actionNameToActionMap: Map<string, Action> = new Map<string, Action>();

  constructor() {
    const actions: Action[] = [{
      name: "actions:omo.shell.layout.delete",
      title: "Delete block",
      action: () => {
        alert("Delete Block.")
      }
    }];
    actions.forEach(a => this._actionNameToActionMap.set(a.name, a));
  }

  findActionByName(name:string) {
    return this._actionNameToActionMap.get(name);
  }

  findActionsForItem(item:any) {
    const schemaId = item.$schemaId;
    if (!schemaId) {
      console.warn("Cannot find a list item for object:", item);
      return null;
    }

    return this._schemaToActionMap.get(schemaId);
  }
}
