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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcG9uZW50UmVnaXN0cmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29tcG9uZW50UmVnaXN0cmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEVBQUU7QUFDRixXQUFXO0FBQ1gsRUFBRTtBQUNGLE9BQU8sVUFBVSxNQUFNLDRCQUE0QixDQUFDO0FBQ3BELE9BQU8sU0FBUyxNQUFNLHFDQUFxQyxDQUFDO0FBQzVELE9BQU8sTUFBTSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3RELE9BQU8sVUFBVSxNQUFNLHNDQUFzQyxDQUFDO0FBQzlELE9BQU8sT0FBTyxNQUFNLG1DQUFtQyxDQUFDO0FBSXhELE1BQU0sT0FBTyxTQUFTO0lBTXBCO1FBTFEsK0JBQTBCLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDekQsaUNBQTRCLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFFM0QsdUJBQWtCLEdBQTBCLElBQUksR0FBRyxFQUFFLENBQUM7UUFJNUQsaUVBQWlFO1FBQ2pFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMseUNBQXlDLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV2RixJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU5RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxFQUFFLENBQUM7Z0JBQ3RFLEtBQUssRUFBRSxRQUFRO2dCQUNmLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO2FBQy9CLEVBQUM7Z0JBQ0EsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7YUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDTixDQUFDO0lBRUQsZUFBZSxDQUFDLElBQVc7UUFDekIsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxJQUFRO1FBQ3pCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsWUFBWSxDQUFDLElBQVE7UUFDbkIsdUVBQXVFO1FBRXZFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDaEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0YifQ==