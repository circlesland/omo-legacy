//
// Elements
//
import Compositor from "./blocks/Compositor.svelte";
import OmoBanner from "./blocks/molecules/OmoBanner.svelte";
import OmoNav from "./blocks/molecules/OmoNav.svelte";
import OmoMessage from "./blocks/molecules/OmoMessage.svelte";
import OmoTest from "./blocks/molecules/OmoTest.svelte";

export class Registrar {
  private _moleculeNameToMoleculeMap: Map<string, any> = new Map();
  private _schemaToListItemMoleculeMap: Map<string, any> = new Map();

  private _actions: Map<string, () => void> = new Map();

  constructor() {

    // TODO: Specify the mapping from entities to list item molecules
    this._schemaToListItemMoleculeMap.set("https://example.com/message.schema.json", OmoMessage);
    this._schemaToListItemMoleculeMap.set("https://example.com/test.schema.json", OmoTest);

    this._moleculeNameToMoleculeMap.set("OmoBanner", OmoBanner);
    this._moleculeNameToMoleculeMap.set("OmoNav", OmoNav);
    this._moleculeNameToMoleculeMap.set("Compositor", Compositor);

    this._actions.set("test", () => alert("test!"));
  }

  findBlockByName(name:string) {
    return this._moleculeNameToMoleculeMap.get(name);
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
