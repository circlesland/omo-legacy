//
// Elements
//
import Compositor from "./blocks/Compositor.svelte";
import OmoBanner from "./blocks/molecules/OmoBanner.svelte";
import OmoNav from "./blocks/molecules/OmoNav.svelte";
import OmoMessage from "./blocks/molecules/OmoMessage.svelte";
import OmoTest from "./blocks/molecules/OmoTest.svelte";
export class Registrar {
    constructor() {
        this._moleculeNameToMoleculeMap = new Map();
        this._schemaToListItemMoleculeMap = new Map();
        this._schemaToActionMap = new Map();
        // TODO: Specify the mapping from entities to list item molecules
        this._schemaToListItemMoleculeMap.set("https://example.com/message.schema.json", OmoMessage);
        this._schemaToListItemMoleculeMap.set("https://example.com/test.schema.json", OmoTest);
        this._moleculeNameToMoleculeMap.set("OmoBanner", OmoBanner);
        this._moleculeNameToMoleculeMap.set("OmoNav", OmoNav);
        this._moleculeNameToMoleculeMap.set("Compositor", Compositor);
        this._schemaToActionMap.set("https://example.com/message.schema.json", [{
                title: "Test 1",
                action: () => alert("Test 1!")
            }, {
                title: "Test 2",
                action: () => alert("Test 2!")
            }]);
    }
    findBlockByName(name) {
        return this._moleculeNameToMoleculeMap.get(name);
    }
    findActionsForItem(item) {
        const schemaId = item.$schemaId;
        if (!schemaId) {
            console.warn("Cannot find a list item for object:", item);
            return null;
        }
        return this._schemaToActionMap.get(schemaId);
    }
    findListItem(item) {
        // TODO: Specify an interface for entities that includes the schema-id.
        const schemaId = item.$schemaId;
        if (!schemaId) {
            console.warn("Cannot find a list item for object:", item);
            return null;
        }
        return this._schemaToListItemMoleculeMap.get(schemaId);
    }
}
//# sourceMappingURL=ComponentRegistrar.js.map