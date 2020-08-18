import {Adapter} from "@omo/textile-graphql/dist/adapter";
import OmoBanner from "./blocks/molecules/OmoBanner.svelte";
import OmoNav from "./blocks/molecules/OmoNav.svelte";
import OmoButton from "./blocks/atoms/OmoButton.svelte";
import ViewCompositor from "./blocks/ViewCompositor.svelte";
import {ModelCompositor} from "./ModelCompositor";

export class OmoSeeder
{
  private readonly _adapter: Adapter

  constructor(textile: Adapter)
  {
    this._adapter = textile;
  }

  private _componentIDsByName: { [name: string]: string } = {};
  private _componentClassByName: { [name: string]: any } = {};
  private _layoutsByName: { [name: string]: string } = {};
  private _actionsByName: { [name: string]: string } = {};

  async seedUI()
  {
    await this.truncateCollection("Layout");
    await this.truncateCollection("Action");
    await this.truncateCollection("ActionInstance");
    await this.truncateCollection("Block");
    await this.truncateCollection("Property");
    await this.truncateCollection("PropertyValue");
    await this.truncateCollection("Component");

    try
    {
      await this.seedLayouts();
      await this.seedActions();

      await this.seedComponents();

      await this.page_Home();
      await this.page_Safe();
    }
    catch (e)
    {
      console.log("SEEDING FAILED!", e);
    }
  }

  navigateToHomeParameterizedActionId?:string;

  private async seedActions()
  {
    const routeProperty = await this.addProperty("route", "string", false);
    const navigateAction = await this.addAction("omo.shell.navigate", "Navigate", "navigate", [routeProperty._id]);
    const parameterizedAction = await this.createParameterizedAction(navigateAction._id, {
      route: "/home"
    });

    this.navigateToHomeParameterizedActionId = parameterizedAction._id;

    console.log("seedAction() parameterizedAction=", parameterizedAction);
  }

  private async seedComponents()
  {
    await this.registerComponent(ViewCompositor);
    await this.registerComponent(OmoBanner);
    await this.registerComponent(OmoButton);
    await this.registerComponent(OmoNav);
  }

  findComponentByName(name:string) {
    return this._componentClassByName[name];
  }

  findActionsForObject(item:any) {
    throw new Error("Not implemented");
  }

  findViewForObject(item:any) {
    // TODO: Specify an interface for entities that includes the schema-id.

    const schemaId = item.$schemaId;
    if (!schemaId) {
      console.warn("Cannot find a list item for object:", item);
      return null;
    }

    throw new Error("Not implemented");

    //return this._schemaToListItemMoleculeMap.get(schemaId);
  }

  /**
   * Registers a svelte component
   * @param componentClass
   */
  private async registerComponent(componentClass:any)
  {
    // Create an element in the shadow dom
    const div = document.createElement("div");
    div.style.visibility = "hidden";
    const shadowRoot = div.attachShadow({
      mode: "closed"
    });
    shadowRoot.innerHTML = "<div></div>";
    const shadowElement = shadowRoot.firstElementChild;
    if (!shadowElement)
      throw new Error("Couldn't create an element in the shadow dom.")

    // Create a temporary instance of the svelte component that should be registered
    const instance = new componentClass({target:shadowElement});
    const properties:string[] = []
    await Promise.all(instance.manifest.properties.map(async (prop:any) => {
      const newProp = await this.addProperty(prop.name, prop.schema, prop.isOptional);
      properties.push(newProp._id);
    }));
    this._componentClassByName[instance.manifest.name] = componentClass;
    const component = await this.addComponent(instance.manifest.name, properties);

    // remove the dom elements
    shadowElement.remove();
    div.remove();

    return component;
  }

  private async seedLayouts()
  {
    await this.addLayout("main & footer", "'main' 'footer'", "1fr", "1fr 4rem");
  }

  private async page_Home()
  {
    const main = await this.addBlockLeaf(this._componentIDsByName["OmoBanner"], "main", []);
    await this.setBlockProperty(main._id, "title", "Hello world");
    await this.setBlockProperty(main._id, "image", "https://source.unsplash.com/random");

    const footer = await this.addBlockLeaf(this._componentIDsByName["OmoNav"], "footer", []);
    await this.setBlockProperty(footer._id, "parameterizedActionIds", [this.navigateToHomeParameterizedActionId]);
    const app = await this.addBlockContainer(this._layoutsByName["main & footer"], [main._id, footer._id], [], "home");
  }

  private async setBlockProperty(blockId: string, propertyName: string, value: any)
  {
    const block = await ModelCompositor.findBlockById(blockId, this._adapter);
    if (!block) {
      throw new Error("Couldn't find a Block with id " + blockId);
    }

    const matchingProperty = block.component.properties.find(o => o.name == propertyName);
    if (!matchingProperty) {
      throw new Error("Couldn't find a property with the name '" + propertyName + "' in block '" + blockId + "'")
    }

    const propertyValue = await this.addPropertyValue(matchingProperty._id, value);

    console.log("Settings property value for block", block, propertyValue);
  }

  private strReplaceAll(str:string, search:string, replacement:string) {
    return str.split(search).join(replacement);
  };

  private async page_Safe()
  {
    const main = await this.addBlockLeaf(this._componentIDsByName["OmoBanner"], "main", []);
    const footer = await this.addBlockLeaf(this._componentIDsByName["OmoNav"], "footer", []);
    const app = await this.addBlockContainer(this._layoutsByName["main & footer"], [main._id, footer._id], [], "home");
  }

  private async createParameterizedAction(actionId:string, parameters:{[propertyName:string]:any})
  {
    // Query the action
    const query = `ActionById(_id:"${actionId}") { _id name properties { _id name schema isOptional } }`;
    const action = (<any>(await this._adapter.graphQL.query(query)).data).ActionById;

    // Check if all required property values have been supplied
    const propertyMap = action.properties.map((prop:any) => {
      return {
        propertyId: prop._id,
        propertyValueId: null,
        name: prop.name,
        value: parameters[prop.name],
        isValid: prop.isOptional || parameters[prop.name]
      }
    });
    const invalidProperties = propertyMap.filter((o:any) => !o.isValid);
    if (invalidProperties && invalidProperties.length > 0) {
      throw new Error("The following non-optional properties have no values: " + OmoSeeder.stringArrayToString(invalidProperties.map((o:any) => o.name)))
    }

    // Create the property values
    await Promise.all(propertyMap.map(async (prop:any) => {
      const propertyValue = await this.addPropertyValue(prop.propertyId, prop.value);
      prop.propertyValueId = propertyValue._id;
    }));

    console.log("Created the following property values:", propertyMap);

    // Create the parameterized action
    const parameterizedAction = await this.addParameterizedAction(actionId, propertyMap.map((o:any) => o.propertyValueId));

    console.log("Created parameterized action:", parameterizedAction);

    return parameterizedAction;
  }

  private async addParameterizedAction(actionId:string, propertyValueIDs:string[]) : Promise<{_id:string, action:{_id:string, name:string}, propertyValues:{_id:string, value:any, property:{_id:string, name:string}}}>
  {
    const propertyValues = OmoSeeder.stringArrayToString(propertyValueIDs);
    const mutation = `addParameterizedAction(actionId: "${actionId}", propertyvaluesIds: [${propertyValues}]) 
    { _id action{ _id name } propertyValues { _id property { _id name } value } }`;
    return (<any>(await this._adapter.graphQL.mutation(mutation)).data).addParameterizedAction;
  }

  private async addPropertyValue(propertyId: string, value:any) : Promise<{_id:string, _createdAt:string, property:{_id:string, name:string}, value:any}>
  {
    let escapedValue = this.strReplaceAll(JSON.stringify(value), '"', "\\\"");
    const mutation = `addPropertyValue(_createdAt: "${new Date().toJSON()}", value: "${escapedValue}", propertyId: "${propertyId}")
    { _id _createdAt property { _id name } value }`;
    return (<any>(await this._adapter.graphQL.mutation(mutation)).data).addPropertyValue;
  }

  private async addLayout(name: string, areas: string, columns: string, rows: string): Promise<{ _id: string, areas: string, columns: string, rows: string }>
  {
    const layout = (<any>await this.mutate(`addLayout(name: "${name}", areas: "${areas}", columns: "${columns}", rows: "${rows}")  { _id name areas columns rows }`)).addLayout;
    this._layoutsByName[layout.name] = layout._id;
    return layout;
  }

  private async addAction(actionName: string, title: string, glyph: string, propertyIDs: string[]): Promise<{ _id: string, name: string, title: string, glyph: string, properties:{_id:string, name:string, schema:string, isOptional:string} }>
  {
    const properties = OmoSeeder.stringArrayToString(propertyIDs);
    const action = (<any>await this.mutate(`addAction(name: "${actionName}", title: "${title}", glyph: "${glyph}", propertiesIds: [${properties}]) {_id name title glyph properties {_id name schema isOptional}}`)).addAction;
    this._actionsByName[actionName] = action._id;
    return action;
  }

  private async addComponent(name: string, propertyIDs:string[]): Promise<{ _id: string, name: string }>
  {
    const properties = OmoSeeder.stringArrayToString(propertyIDs);
    const component = (<any>await this.mutate(`addComponent(name: "${name}", propertiesIds: [${properties}])  {_id name}`)).addComponent;
    this._componentIDsByName[component.name] = component._id;
    return component;
  }

  private async addProperty(propertyName: string, propertySchema: string, isOptional: boolean): Promise<{ _id: string, name: string, schema: string, isOptional: boolean }>
  {
    const property = (<any>await this.mutate(`addProperty(name: "${propertyName}", schema: "${propertySchema}", isOptional: "${isOptional}") {_id name schema isOptional Component {_id}}`)).addProperty;
    return property;
  }

  private async addBlockLeaf(componentId: string, area: string, actionIDs: string[]): Promise<{ _id: string, name: string }>
  {
    const actions = actionIDs.map(o => "\"" + o + "\"").join(",");
    return (<any>await this.mutate(`addBlock(area: "${area}", componentId: "${componentId}")  {_id area layout{_id} component{_id} }`)).addBlock;
  }

  private static stringArrayToString(array:string[]) {
    if (!array)
      return "";
    return array.map(o => "\"" + o + "\"").join(",");
  }

  private async addBlockContainer(layoutId: string, childrenIDs: string[], actionIDs: string[] = [], name?: string, area?: string): Promise<{ _id: string, name: string }>
  {
    const actions = OmoSeeder.stringArrayToString(actionIDs);
    const children = OmoSeeder.stringArrayToString(childrenIDs);
    const mutationFields = [];
    if (area)
    {
      mutationFields.push(`area: "${area}"`);
    }
    if (name)
    {
      mutationFields.push(`name: "${name}"`);
    }

    let optionalFields = mutationFields.join(",");
    optionalFields = optionalFields.length > 0 ? optionalFields + ", " : "";
    const mutation = `addBlock(${optionalFields} layoutId: "${layoutId}", componentId: "${this._componentIDsByName["ViewCompositor"]}", childrenIds: [${children}])  {_id area name layout{_id} component{_id}}`;
    return this.mutate(mutation);
  }

  private async mutate<T extends (object & { _id: string })>(mutation: string): Promise<T>
  {
    const result = await this._adapter.graphQL.mutation(mutation)
    if (result.errors && result.errors.length > 0)
    {
      throw new Error("Couldn't seed component '" + name + "'" + JSON.stringify(result.errors));
    }
    return <any>result.data;
  }

  private async truncateCollection(collectionName: string)
  {
    const threadName = "QUANTA";
    const thread = await this._adapter.threads.getOrCreateThread(threadName, undefined);
    const collection = await thread.getCollection(collectionName);
    if (!collection)
    {
      throw new Error("Cannot find collection '" + collectionName + "' in thread '" + threadName + "'.");
    }
    await collection.truncate();
  }
}
