import { JSONSchema } from "@textile/hub";
import {Message} from "../schema/message";

export interface SeedQuant {
  name: string,
  schema: JSONSchema,
  data: any[]
}

interface Seed {
  thread: {
    name: string,
    quanta: SeedQuant[]
  }
}

const seeds: Seed[] = [{
  thread: {
    name: "quanta", quanta: [
      {
        name: "Message",
        schema: Message,
        data: []
      }
    ]
  }
}];

export class Seeder {
  async getSeed(threadName: string) {
    let thread = seeds.find(x => x.thread.name == threadName);
    if (thread)
      return thread.thread.quanta;
    return [];
  }
}
