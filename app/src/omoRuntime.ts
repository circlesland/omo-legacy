import {Registrar} from "./ComponentRegistrar";
import {EventBroker} from "@omo/events/dist/EventBroker";

export class OmoRuntime {
    readonly registry = new Registrar();
    readonly events = new EventBroker();
}
