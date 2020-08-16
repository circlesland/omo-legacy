import { JSONSchema } from "@textile/hub";
import {Component, Layout, Block, Action} from "../schema/block";

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
        name: "Component",
        schema: Component,
        data: []
      },
      {
        name: "Layout",
        schema: Layout,
        data: []
      },
      {
        name: "Block",
        schema: Block,
        data: []
      },
      {
        name: "Action",
        schema: Action,
        data: []
      }
    ]
  }
}];

export class Seeder {
  async getSeed(threadName: string) {
    let thread = seeds.find(x => x.thread.name == threadName);
    console.log("Seeding:", thread);
    if (thread)
      return thread.thread.quanta;
    return [];
  }
}
