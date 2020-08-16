import { Registrar } from "./ComponentRegistrar";
import { EventBroker } from "@omo/events/dist/EventBroker";
export class OmoRuntime {
    constructor() {
        this.registry = new Registrar();
        this.events = new EventBroker();
    }
}
//# sourceMappingURL=omoRuntime.js.map