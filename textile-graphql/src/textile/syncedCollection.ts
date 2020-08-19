import { Instance } from "@textile/threads-store";
import { ICollection } from "./collection";
import { RemoteCollection } from "./remoteCollection";
import { LocalCollection } from "./localCollection";
import { FilterQuery } from "@textile/hub";
import { LocalThread } from "./localThread";
//import { RemoteThread } from "./remoteThread";

export class SyncedCollection<T extends Instance> implements ICollection<T>
{
  collectionName: string;
  localCollection: LocalCollection<T>;
  //remoteCollectionPromise: Promise<RemoteCollection<T>>;

  private constructor(localCollection: LocalCollection<T>/*, remoteCollectionPromise: Promise<RemoteCollection<T>>*/, collectionName: string) {
    this.localCollection = localCollection;
    //this.remoteCollectionPromise = remoteCollectionPromise;
    this.collectionName = collectionName;
  }

  static async init<T extends Instance>(collectionName: string, localThread: LocalThread/*, remoteThread: RemoteThread*/, awaitSync: boolean = false): Promise<SyncedCollection<T>> {
    let localCollection = await localThread.getCollection<T>(collectionName);
    //let remoteCollectionPromise = remoteThread.getCollection<T>(collectionName);
    let instance = new SyncedCollection<T>(localCollection/*, remoteCollectionPromise*/, collectionName);
    return instance;
  }

  static async fakeSyncCollections<T extends Instance>(localCollection: LocalCollection<T>/*, remoteCollectionPromise: Promise<RemoteCollection<T>>*/, collectionName: string) {
    console.log(`start sync with ${collectionName}`)

    //let remoteCollection = await remoteCollectionPromise;
    //let all = await remoteCollection.all();
    //await localCollection.createOrSaveMany(all);
    //await remoteCollection.observeUpdate(["CREATE"], "", async (instance:any) => {
    //  if (instance)
    //    await localCollection.createOrSave(instance.instance);
    //});
    //await remoteCollection.observeUpdate(["SAVE"], "", async (instance:any) => {
    //  if (instance)
    //    await localCollection.createOrSave(instance.instance);
    //});
    /*
    remoteCollection.observeUpdate(["DELETE"], "", async (instance) => {
        console.log("DELETE", instance);
        await localCollection.save(instance);
    })*/
    console.log(`sync completed with ${collectionName}`)
  }

  async all(): Promise<T[]> {
    return await this.localCollection.all();
  }

  async find(query: FilterQuery<T>): Promise<T[]> {
    // return await this.localCollection.find(query);
    return await this.localCollection.find(query);
  }

  async findById(id: string): Promise<T> {
    return await this.localCollection.findById(id);
  }

  async deleteCollection(): Promise<void> {
    // this.remoteCollection.deleteCollection();
    return await this.localCollection.deleteCollection();
  }

  async truncate(): Promise<void> {
    //let rc = await this.remoteCollectionPromise;
    //await rc.truncate();
    return await this.localCollection.truncate();
  }

  async create(value: T): Promise<T> {
    value = await this.localCollection.create(value);
    //this.remoteCollectionPromise.then(rc => rc.createOrSave(value));
    return value;
  }

  async createMany(values: T[]): Promise<T[]> {
    values = await this.localCollection.createMany(values);
    //this.remoteCollectionPromise.then(rc => rc.createOrSaveMany(values));
    return values;
  }

  async save(value: T): Promise<T> {
    value = await this.localCollection.save(value);
    //this.remoteCollectionPromise.then(rc => rc.createOrSave(value));
    return value;
  }

  async saveMany(values: T[]): Promise<T[]> {
    values = await this.localCollection.saveMany(values);
    //this.remoteCollectionPromise.then(rc => rc.createOrSaveMany(values));
    return values;
  }

  async createOrSave(value: T): Promise<T> {
    value = await this.localCollection.createOrSave(value);
    //this.remoteCollectionPromise.then(rc => rc.createOrSave(value));
    return value;
  }

  async createOrSaveMany(values: T[]): Promise<T[]> {
    values = await this.localCollection.createOrSaveMany(values);
    //this.remoteCollectionPromise.then(rc => rc.createOrSaveMany(values));
    return values;
  }

  async delete(value: T): Promise<void> {
    //this.remoteCollectionPromise.then(rc => rc.delete(value));
    return this.localCollection.delete(value);
  }

  async deleteMany(values: T[]): Promise<void> {
    //this.remoteCollectionPromise.then(rc => rc.deleteMany(values));
    return this.localCollection.deleteMany(values);
  }

  async deleteById(value: string): Promise<void> {
    //this.remoteCollectionPromise.then(rc => rc.deleteById(value));
    return await this.localCollection.deleteById(value);
  }

  async deleteManyByIds(values: string[]): Promise<void> {
    //this.remoteCollectionPromise.then(rc => rc.deleteManyByIds(values));
    return this.localCollection.deleteManyByIds(values);
  }

  async observeUpdate(actionTypes: string[], id: string, callback: any): Promise<void> {
    await this.localCollection.observeUpdate(actionTypes, id, callback);
  }
}
