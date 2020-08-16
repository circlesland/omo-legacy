import { Registrar } from "./ComponentRegistrar";
import { EventBroker } from "@omo/events/dist/EventBroker";
export class OmoRuntime {
    constructor() {
        this.registry = new Registrar();
        this.events = new EventBroker();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib21vUnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9tb1J1bnRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQy9DLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUV6RCxNQUFNLE9BQU8sVUFBVTtJQUF2QjtRQUNhLGFBQVEsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQzNCLFdBQU0sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQ3hDLENBQUM7Q0FBQSJ9