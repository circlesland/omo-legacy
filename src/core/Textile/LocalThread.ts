import { KeyInfo, Database, JSONSchema } from "@textile/hub";
import { Instance } from "@textile/threads-store";
import { LocalCollection } from "./LocalCollection";

export class LocalThread {
  private database: Database;
  private collections: LocalCollection<any>[];

  private constructor(db: Database) {
    this.database = db;
    this.collections = [];
  }

  static async init(threadName: any): Promise<LocalThread> {
    let localAuth: KeyInfo = {
      key: process.env.GROUP_API_KEY || '',
      secret: process.env.GROUP_API_SECRET || ''
    };
    let local = await Database.withKeyInfo(localAuth, threadName, undefined, undefined, true);
    var instance = new LocalThread(local);
    return instance;
  }

  async start() {
    await this.database.start(await Database.randomIdentity());
  }

  async hasCollection(collectionName: string): Promise<boolean> {
    return this.database.collections.has(collectionName);
  }

  async createCollection(collectionName: string, schema: JSONSchema) {
    await this.database.newCollection(collectionName, schema);
  }

  async getCollection<X extends Instance>(collectionName: string): Promise<LocalCollection<X>> {
    if (this.collections.some(x => x.collectionName == collectionName)) {
      return this.collections.find(x => x.collectionName == collectionName) as LocalCollection<X>;
    }
    var localCollection = new LocalCollection<X>(collectionName, this.database);
    this.collections.push(localCollection);
    return localCollection;
  }

  async getOrCreateCollection<X extends Instance>(collectionName: string, schema: JSONSchema) {
    if (!await this.hasCollection(collectionName))
      await this.createCollection(collectionName, schema);
    return await this.getCollection<X>(collectionName);
  }
}
