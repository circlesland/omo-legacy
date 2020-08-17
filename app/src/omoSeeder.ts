import {Adapter} from "@omo/textile-graphql/dist/adapter";
import {Manifest} from "./interfaces/manifest";
import OmoBanner from "./blocks/molecules/OmoBanner.svelte";
import OmoNav from "./blocks/molecules/OmoNav.svelte";
import OmoButton from "./blocks/atoms/OmoButton.svelte";
import ViewCompositor from "./blocks/ViewCompositor.svelte";

export class OmoSeeder
{
  private readonly _adapter: Adapter

  constructor(textile: Adapter)
  {
    this._adapter = textile;
  }

  private _componentsByName: { [name: string]: string } = {};
  private _layoutsByName: { [name: string]: string } = {};
  private _propertiesByName: { [name: string]: string } = {};
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

  private async seedActions()
  {
  }

  private async seedComponents()
  {
    const div = document.createElement("div");
    div.style.visibility = "hidden";
    const shadowRoot = div.attachShadow({
      mode: "closed"
    });
    shadowRoot.innerHTML = "<div></div>";
    const shadowElement = shadowRoot.firstElementChild;
    if (!shadowElement)
      throw new Error("Couldn't create an element in the shadow dom.")

    await this.seedComponent(new OmoBanner({target: shadowElement}), []);
    await this.seedComponent(new OmoButton({target: shadowElement}), []);
    await this.seedComponent(new OmoNav({target: shadowElement}), []);
    await this.seedComponent(new ViewCompositor({target: shadowElement}), []);
  }

  private async seedComponent(instance:any, actions:string[]) {
    const properties:string[] = []
    await Promise.all(instance.manifest.properties.map(async (prop:any) => {
      const newProp = await this.addProperty(prop.name, prop.schema, prop.isOptional);
      properties.push(newProp._id);
    }));
    const component = await this.addComponent(instance.manifest.name, properties, actions);
    return component;
  }

  private async seedLayouts()
  {
    await this.addLayout("main & footer", "'main' 'footer'", "1fr", "1fr 4rem");
  }

  private async page_Home()
  {
    const main = await this.addBlockLeaf(this._componentsByName["OmoBanner"], [], "main");
    const footer = await this.addBlockLeaf(this._componentsByName["OmoNav"], [], "footer");
    const app = await this.addBlockContainer(this._layoutsByName["main & footer"], [], [main._id, footer._id], "home");
  }

  private async page_Safe()
  {
    const main = await this.addBlockLeaf(this._componentsByName["OmoBanner"], [], "main");
    const footer = await this.addBlockLeaf(this._componentsByName["OmoNav"], [], "footer");
    const app = await this.addBlockContainer(this._layoutsByName["main & footer"], [], [main._id, footer._id], "home");
  }

  private async addLayout(name: string, areas: string, columns: string, rows: string): Promise<{ _id: string, areas: string, columns: string, rows: string }>
  {
    const layout = (<any>await this.mutate(`addLayout(name: "${name}", areas: "${areas}", columns: "${columns}", rows: "${rows}")  { _id name areas columns rows }`)).addLayout;
    this._layoutsByName[layout.name] = layout._id;
    return layout;
  }

  private async addAction(actionName: string, title: string, glyph: string, direction: string): Promise<{ _id: string, name: string, title: string, glyph: string }>
  {
    const action = (<any>await this.mutate(`addAction(name: "${actionName}", title: "${title}", glyph: "${glyph}", direction: "${direction}") {_id name title glyph}`)).addAction;
    this._actionsByName[actionName] = action._id;
    return action;
  }

  private async addComponent(name: string, propertyIDs:string[], actionIDs:string[]): Promise<{ _id: string, name: string }>
  {
    const properties = OmoSeeder.stringArrayToString(propertyIDs);
    const actions = OmoSeeder.stringArrayToString(actionIDs);
    const component = (<any>await this.mutate(`addComponent(name: "${name}", propertiesIds: [${properties}], actionsIds: [${actions}])  {_id name}`)).addComponent;
    this._componentsByName[component.name] = component._id;
    return component;
  }

  private async addProperty(propertyName: string, propertySchema: string, isOptional: boolean): Promise<{ _id: string, name: string, schema: string, isOptional: boolean }>
  {
    const property = (<any>await this.mutate(`addProperty(name: "${propertyName}", schema: "${propertySchema}", isOptional: "${isOptional}") {_id name schema isOptional Component {_id}}`)).addProperty;
    this._propertiesByName[propertyName] = property._id;
    return property;
  }

  private async addBlockLeaf(componentId: string, actionIDs: string[], area: string): Promise<{ _id: string, name: string }>
  {
    const actions = actionIDs.map(o => "\"" + o + "\"").join(",");
    return (<any>await this.mutate(`addBlock(area: "${area}", componentId: "${componentId}")  {_id area layout{_id} component{_id} }`)).addBlock;
  }

  private static stringArrayToString(array:string[]) {
    if (!array)
      return "";
    return array.map(o => "\"" + o + "\"").join(",");
  }

  private async addBlockContainer(layoutId: string, actionIDs: string[], childrenIDs: string[], name?: string, area?: string): Promise<{ _id: string, name: string }>
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
    const mutation = `addBlock(${optionalFields} layoutId: "${layoutId}", componentId: "${this._componentsByName["Compositor"]}", childrenIds: [${children}])  {_id area name layout{_id} component{_id}}`;
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
