import {Adapter} from "@omo/textile-graphql/dist/adapter";

export class OmoSeeder
{
    private readonly _adapter: Adapter

    constructor(textile: Adapter)
    {
        this._adapter = textile;
    }

    private _componentsByName: { [name: string]: string } = {};
    private _layoutsByName: { [name: string]: string } = {};
    private _propertiesByComponentAndPropertyName: { [componentName: string]: {[propertyName:string]:string} } = {};
    private _actionsByComponentAndActionName: { [componentName: string]: {[actionName:string]:string} } = {};

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

            await this.seedComponents();


            await this.page_Home();
            await this.page_Safe();
        }
        catch (e)
        {
            console.log("SEEDING FAILED!", e);
        }
    }

    private async seedComponents()
    {
        await this.addComponent("OmoBanner");
        await this.addComponentProperty("OmoBanner", "title", "string", false);

        await this.addComponent("OmoList");
        await this.addComponent("OmoMessage");
        await this.addComponent("OmoNav");
    }

    private async seedLayouts()
    {
        await this.addLayout("main & footer", "'main' 'footer'", "1fr", "1fr 4rem");
    }

    private async page_Home()
    {
        await this.addComponent("Compositor");

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

    private async addComponentAction(componentName:string, actionName: string, title: string, glyph:string, direction:string): Promise<{ _id: string, name: string, title: string, glyph:string }>
    {
        const componentId = this._componentsByName[componentName];
        if (!componentId)
            throw new Error("Couldn't find a component with the name '" + componentName + "' to add action '" + actionName + "'.");

        const action = (<any>await this.mutate(`addAction(name: "${actionName}", title: "${title}", glyph: "${glyph}", direction: "${direction}", componentId: "${componentId}") {_id}`)).addAction;
        this._actionsByComponentAndActionName[componentName][actionName] = action._id;
        return action;
    }

    private async addComponent(name: string): Promise<{ _id: string, name: string }>
    {
        const component = (<any>await this.mutate(`addComponent(name: "${name}")  {_id name}`)).addComponent;
        this._componentsByName[component.name] = component._id;
        this._propertiesByComponentAndPropertyName[component.name] = {};
        this._actionsByComponentAndActionName[component.name] = {};
        return component;
    }

    private async addComponentProperty(componentName:string, propertyName:string, propertySchema:string, isOptional:boolean) : Promise<{ _id:string, name:string, schema:string, isOptional:boolean, componentId:string }> {
        const componentId = this._componentsByName[componentName];
        if (!componentId)
            throw new Error("Couldn't find a component with the name '" + componentName + "' to add property '" + propertyName + "'.");
        const property = (<any>await this.mutate(`addProperty(name: "${propertyName}", schema: "${propertySchema}", isOptional: "${isOptional}", componentId: "${componentId}") {_id name schema isOptional Component {_id}}`)).addProperty;
        this._propertiesByComponentAndPropertyName[componentName][propertyName] = property._id;
        return property;
    }

    private async addBlockLeaf(componentId: string, actionIDs: string[], area: string): Promise<{ _id: string, name: string }>
    {
        const actions = actionIDs.map(o => "\"" + o + "\"").join(",");
        return (<any>await this.mutate(`addBlock(area: "${area}", componentId: "${componentId}", actionsIds: [${actions}])  {_id area layout{_id} component{_id} }`)).addBlock;
    }

    private async addBlockContainer(layoutId: string, actionIDs: string[], childrenIDs: string[], name?: string, area?: string): Promise<{ _id: string, name: string }>
    {
        const actions = actionIDs.map(o => "\"" + o + "\"").join(",");
        const children = childrenIDs.map(o => "\"" + o + "\"").join(",");
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
        const mutation = `addBlock(${optionalFields} layoutId: "${layoutId}", componentId: "${this._componentsByName["Compositor"]}", actionsIds: [${actions}], childrenIds: [${children}])  {_id area name layout{_id} component{_id}}`;
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
