//
// Elements
//
import Compositor from "./blocks/Compositor.svelte";
import OmoBanner from "./blocks/molecules/OmoBanner.svelte";
import OmoNav from "./blocks/molecules/OmoNav.svelte";
import OmoMessage from "./blocks/molecules/OmoMessage.svelte";

export type Action = { name: string, title:string, action: () => void };

export class Registrar {
  private _moleculeNameToMoleculeMap: Map<string, any> = new Map();
  private _schemaToListItemMoleculeMap: Map<string, any> = new Map();
  private _schemaToActionMap: Map<string, Action[]> = new Map();
  private _actionNameToActionMap: Map<string, Action> = new Map<string, Action>();

  constructor() {

    // TODO: Specify the mapping from entities to list item molecules
    this._schemaToListItemMoleculeMap.set("https://example.com/message.schema.json", OmoMessage);

    this._moleculeNameToMoleculeMap.set("OmoBanner", OmoBanner);
    this._moleculeNameToMoleculeMap.set("OmoNav", OmoNav);

    const actions: Action[] = [{
      name: "actions:omo.shell.layout.delete",
      title: "Delete block",
      action: () => {
        alert("Delete Block.")
      }
    }];
    actions.forEach(a => this._actionNameToActionMap.set(a.name, a));

    this._moleculeNameToMoleculeMap.set("Compositor", Compositor);
  }

  findActionByName(name:string) {
    return this._actionNameToActionMap.get(name);
  }

  findBlockByName(name:string) {
    return this._moleculeNameToMoleculeMap.get(name);
  }

  findActionsForItem(item:any) {
    const schemaId = item.$schemaId;
    if (!schemaId) {
      console.warn("Cannot find a list item for object:", item);
      return null;
    }

    return this._schemaToActionMap.get(schemaId);
  }

  findListItem(item:any) {
    // TODO: Specify an interface for entities that includes the schema-id.

    const schemaId = item.$schemaId;
    if (!schemaId) {
      console.warn("Cannot find a list item for object:", item);
      return null;
    }

    return this._schemaToListItemMoleculeMap.get(schemaId);
  }
}
