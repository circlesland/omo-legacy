import { Registrar } from "./ComponentRegistrar";
import { EventBroker } from "@omo/events/dist/EventBroker";
import {Adapter} from "@omo/textile-graphql/dist/adapter";
import {GraphQL} from "@omo/textile-graphql/dist/data/graphQL";

export class OmoRuntime {
    readonly registry = new Registrar();
    readonly events = new EventBroker();
    readonly textile: Adapter;
    readonly graphQL: GraphQL

    private constructor(textile: Adapter)
    {
        this.registry = new Registrar();
        this.events = new EventBroker();
        this.textile = textile;
        this.graphQL = this.textile.graphQL;
    }

    static async init() {
        const adapter = await Adapter.create();
        return new OmoRuntime(adapter);
    }
}
