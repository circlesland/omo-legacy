import { Registrar } from "./ComponentRegistrar";
import { EventBroker } from "@omo/events/dist/EventBroker";
import {Adapter} from "@omo/textile-graphql/dist/adapter";

export class OmoRuntime {
    readonly registry = new Registrar();
    readonly events = new EventBroker();
    readonly textile: Adapter;

    private constructor(textile: Adapter)
    {
        this.registry = new Registrar();
        this.events = new EventBroker();
        this.textile = textile;
    }

    static async init() {
        const adapter = await Adapter.create();
        return new OmoRuntime(adapter);
    }
}
