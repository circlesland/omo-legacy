import { Quant } from "../data/quant";
import { Threads } from "../textile/threads";
import { Seeder } from "../data/seeder";
import { ModelHelper } from "../data/modelHelper";
import { SyncedCollection } from "../textile/syncedCollection";
import { SyncedThread } from "../textile/syncedThread";
import { Instance } from "@textile/threads-store";
import {QuantSchema} from "../data/quantSchema";

export class QuantRegistry {
  quantThread: SyncedThread;
  quantaCollection: SyncedCollection<Quant>;
  modelHelper: ModelHelper;
  collections: SyncedCollection<Instance>[];

  private constructor(quantaCollection: SyncedCollection<Quant>, quantThread: SyncedThread, modelHelper: ModelHelper) {
    this.quantaCollection = quantaCollection;
    this.quantThread = quantThread;
    this.modelHelper = modelHelper;
    this.collections = [];
  }

  async resetToDefault() {
    await this.quantaCollection.truncate();
  }

  static async init(threads: Threads, seed: boolean = false): Promise<QuantRegistry> {
    var quantaThread = await threads.getOrCreateThread("QUANTA", process.env.QUANTATHREAD);
    var quantaCollection = await quantaThread.getOrCreateCollection<Quant>("QUANTA", QuantSchema, true);
    await quantaCollection.truncate();
    var modelHelper = await this.getModelHelper(quantaCollection, seed)
    var instance = new QuantRegistry(quantaCollection, quantaThread, modelHelper);
    return instance;
  }

  async getCollection<T extends Instance>(collectionName:string) {
    var quant = this.modelHelper.modelQuanta.find(x => x.collectionName == collectionName);
    if (!quant) throw new Error("Quant not registered");
    let collection = this.collections.find(x => x.collectionName == collectionName);
    if (collection) return collection;
    let col = await this.quantThread.getOrCreateCollection(collectionName, quant.toTextileSchema());
    this.collections.push(col);
    return col;
  }

  async syncAllCollections() {
    for (let c of this.collections)
      SyncedCollection.fakeSyncCollections(c.localCollection, c.remoteCollectionPromise, c.collectionName);
  }

  static async getModelHelper(collection: SyncedCollection<Quant>, seed: boolean): Promise<ModelHelper> {
    var quanta = await collection.all();

    if (seed) {
      var seeder = new Seeder();
      var seedQuanta = await seeder.getSeed("quanta");
      for (let q of seedQuanta) {
        var arr = quanta.filter(x => x.name != q.name);
        var newQuant = quanta.find(x => x.name == q.name) || new Quant();
        newQuant.collectionName = q.name;
        newQuant.jsonSchema = JSON.stringify(q.schema);
        newQuant.name = q.name;
        arr.push(newQuant);
        quanta = arr;
      }
    }

    var modelHelper = new ModelHelper(quanta);

    if (seed)
      quanta = await collection.createOrSaveMany(modelHelper.quanta);

    return modelHelper;
  }
}
