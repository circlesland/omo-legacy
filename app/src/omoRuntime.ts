import {EventBroker} from "@omo/events/dist/EventBroker";
import {Adapter} from "@omo/textile-graphql/dist/adapter";
import {GraphQL} from "@omo/textile-graphql/dist/data/graphQL";
import {OmoSeeder} from "./omoSeeder";

export class OmoRuntime
{
  readonly seeder: OmoSeeder;
  readonly events = new EventBroker();
  readonly textile: Adapter;
  readonly graphQL: GraphQL

  private static _singletonInstance: Promise<OmoRuntime>;

  private constructor(textile: Adapter)
  {
    this.events = new EventBroker();
    this.textile = textile;
    this.graphQL = this.textile.graphQL;
    this.seeder = new OmoSeeder(this.textile);
  }

  static async get()
  {
    if (OmoRuntime._singletonInstance)
    {
      return OmoRuntime._singletonInstance;
    }

    OmoRuntime._singletonInstance = new Promise<OmoRuntime>(async (resolve) =>  {
      const adapter = await Adapter.create();
      const runtime = new OmoRuntime(adapter);
      await runtime.seeder.seedUI();
      resolve(runtime);
    });

    return OmoRuntime._singletonInstance;
  }
}
