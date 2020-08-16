import {Adapter} from "@omo/textile-graphql/dist/adapter";

export class OmoSeeder
{
    private readonly _adapter:Adapter

    constructor(textile:Adapter)
    {
        this._adapter = textile;
    }

    private compositorId?:string;

    async seedUI() {
        await this.truncateCollection("Layout");
        await this.truncateCollection("Action");
        await this.truncateCollection("Block");
        await this.truncateCollection("Component");

        try
        {
            const compositor = await this.addComponent("Compositor");
            this.compositorId = compositor._id;

            const banner = await this.addComponent("OmoBanner");
            const list = await this.addComponent("OmoList");
            const message = await this.addComponent("OmoMessage");
            const nav = await this.addComponent("OmoNav");

            const layout = await this.addLayout("main & footer", "'main' 'footer'", "1fr", "1fr 4rem");

            const main = await this.addBlockLeaf(banner._id, [], layout._id);
            const footer = await this.addBlockLeaf(nav._id, [], layout._id);
            const app = await this.addBlockContainer(layout._id, [], [main._id, footer._id],  "home");
        }
        catch (e)
        {
            console.log("SEEDING FAILED!", e);
        }
    }

    private async addLayout(name:string, areas:string, columns:string, rows:string) : Promise<{_id:string, areas:string, columns:string, rows:string}> {
        return (<any>await this.mutate(`addLayout(name: "${name}", areas: "${areas}", columns: "${columns}", rows: "${rows}")  { _id name areas columns rows }`)).addLayout;
    }

    private async addAction(name:string, title:string) : Promise<{_id:string, name:string, title:string}> {
        return (<any>await this.mutate(`addAction(name: "${name}" title:"${title}")  {_id name title}`)).addAction;
    }

    private async addComponent(name:string) : Promise<{_id:string, name:string}> {
        return (<any>await this.mutate(`addComponent(name: "${name}")  {_id name}`)).addComponent;
    }

    private async addBlockLeaf(componentId:string, actionIDs:string[], area:string) : Promise<{_id:string, name:string}> {
        const actions = actionIDs.map(o => "\"" + o + "\"").join(",");
        return (<any>await this.mutate(`addBlock(area: "${area}", componentId: "${componentId}", actionsIds: [${actions}])  {_id area layout{_id} component{_id} }`)).addBlock;
    }

    private async addBlockContainer(layoutId:string, actionIDs:string[], childrenIDs:string[], name?:string, area?:string) : Promise<{_id:string, name:string}> {
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
        const muation = `addBlock(${optionalFields} layoutId: "${layoutId}", componentId: "${this.compositorId}", actionsIds: [${actions}], childrenIds: [${children}])  {_id area name layout{_id} component{_id}}`;
        return this.mutate(muation);
    }

    private async mutate<T extends (object & {_id:string})>(mutation:string) : Promise<T> {
        const result = await this._adapter.graphQL.mutation(mutation)
        if (result.errors && result.errors.length > 0) {
            throw new Error("Couldn't seed component '" + name + "'" + JSON.stringify(result.errors));
        }
        return <any>result.data;
    }

    private async truncateCollection(collectionName:string)
    {
        const threadName = "QUANTA";
        const thread = await this._adapter.threads.getOrCreateThread(threadName, undefined);
        const collection = await thread.getCollection(collectionName);
        if (!collection) {
            throw new Error("Cannot find collection '" + collectionName + "' in thread '" + threadName + "'.");
        }
        await collection.truncate();
    }
}
