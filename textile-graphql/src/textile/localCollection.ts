import { Instance } from "@textile/threads-store";
import { Collection, FilterQuery } from "@textile/hub";
import { ICollection } from "./collection";
import { Result, Database } from "@textile/threads-database";

export class LocalCollection<T extends Instance> implements ICollection<T>
{
  private collection: Collection<T>;
  private database: Database;
  collectionName: string;

  constructor(collectionName: string, database: Database) {
    this.collectionName = collectionName;
    this.database = database;
    if (!database.collections.has(collectionName)) throw new Error(`Collection "${collectionName}" not found in database`);
    this.collection = database.collections.get(collectionName) as Collection<T>;
  }

  private async toArray<T>(iterator: AsyncIterable<Result<T>>): Promise<T[]> {
    const arr = Array<T>();
    try {

      for await (const entry of iterator) {
        arr.push(entry.value);
      }
    }
    catch (e) {

      console.error(e);
      //debugger;
    }
    return arr;
  }

  async all(): Promise<T[]> {
    return await this.find({});
  }

  async find(query: FilterQuery<T>): Promise<T[]> {
    var result = this.collection.find(query);
    return await this.toArray<T>(result);
  }

  async findById(id: string): Promise<T> {
    return await this.collection.findById(id);
  }

  async deleteCollection(): Promise<void> {
    throw new Error("NotSupported");
  }

  async truncate(): Promise<void> {
    var ids = (await this.find({})).map(x => x._id);
    await this.collection.delete(...ids);
  }

  async create(value: T): Promise<T> {
    await this.collection.insert(value);
    return value;
  }

  async createMany(values: T[]): Promise<T[]> {
    await this.collection.insert(...values);
    return values;
  }

  async save(value: T): Promise<T> {
    await this.collection.save(value);
    return value;
  }

  async saveMany(values: T[]): Promise<T[]> {
    await this.collection.save(...values);
    return values;
  }

  async createOrSave(value: T): Promise<T> {
    if (value._id)
      return await this.save(value);
    else
      return await this.create(value);
  }
  async createOrSaveMany(values: T[]): Promise<T[]> {
    var updates: T[] = [];
    var creates: T[] = [];
    for (let val of values) {
      delete val.ID;
      if (val._id && await this.collection.has(val._id)) updates.push(val);
      else creates.push(val);
    }
    let updateAsync = this.saveMany(updates);
    let createAsync = this.createMany(creates);
    let result = await Promise.all([updateAsync, createAsync]);
    return [...result[0], ...result[1]];
  }

  async delete(value: T): Promise<void> {
    await this.collection.delete(value._id);
  }

  async deleteMany(values: T[]): Promise<void> {
    await this.collection.delete(...values.map(x => x._id));
  }

  async deleteById(value: string): Promise<void> {
    await this.collection.delete(value);
  }

  async deleteManyByIds(values: string[]): Promise<void> {
    await this.collection.delete(...values);
  }

  async observeUpdate(actionTypes: string[], id: string, callback: any): Promise<void> {
    actionTypes.forEach(actionType => {
      let observeType = '*'; // default listen to all

      switch (actionType.toLowerCase()) {
        case "create": observeType = '0'; break;
        case "save": observeType = '1'; break;
        case "delete": observeType = '2'; break;
      };

      this.database.emitter.on(`${this.collectionName}.*.${observeType}`,
        async (update) => {
          console.log("UPDATE LOCAL", update);
          if (update.collection == this.collectionName && (update.type == observeType || observeType == '*'))
            callback(update);
        });
    });
  }
}

export type Update = {
  Collection: string;
  Type: UpdateType;
  Id: string;
}

export enum UpdateType {
  CREATE,
  SAVE,
  DELETE,
  ALL
}
