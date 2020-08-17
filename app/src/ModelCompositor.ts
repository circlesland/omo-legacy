import {Adapter} from "@omo/textile-graphql/dist/adapter";

export class ModelCompositor
{
    private readonly _adapter:Adapter;

    constructor(adapter:Adapter)
    {
        this._adapter = adapter;
    }

    fromRoot(blockName:string) {
    }
}
