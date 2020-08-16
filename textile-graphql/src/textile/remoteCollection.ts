import { Instance } from "@textile/threads-store";
import { ThreadID, KeyInfo} from "@textile/hub";
import Client from "@textile/threads-client";
import { ICollection } from "./collection";

export class RemoteCollection<T extends Instance> implements ICollection<T>
{
  private threadId: ThreadID;
  collectionName: string;

  constructor(threadId: ThreadID, collectionName: string) {
    this.threadId = threadId;
    this.collectionName = collectionName;
  }

  private async getClient() {
    let remoteAuth: KeyInfo = {
      key: process.env.USER_API_KEY || '',
      secret: process.env.USER_API_SECRET || ''
    };
    return await Client.withKeyInfo(remoteAuth);
  }

  async all(): Promise<T[]> {
    var client = await this.getClient();
    var response = await client.find<T>(this.threadId, this.collectionName, {});
    return response.instancesList;
  }

  async find(query: any): Promise<T[]> {
    console.warn("FILTER NOT SUPPORTED YET ON REMOTE DB ");
    var client = await this.getClient();
    var response = await client.find<T>(this.threadId, this.collectionName, query);
    return response.instancesList;
  }

  async findById(id: string): Promise<T> {
    var client = await this.getClient();
    var response = await client.findByID<T>(this.threadId, this.collectionName, id);
    return response.instance;
  }

  async deleteCollection() {
    let client = await this.getClient();
    await client.deleteCollection(this.threadId, this.collectionName);
  }

  async truncate() {
    let client = await this.getClient();
    var entities = await client.find<Instance>(this.threadId, this.collectionName, {});
    await client.delete(this.threadId, this.collectionName, entities.instancesList.map(e => e._id));
  }

  async create(value: T) {
    let client = await this.getClient();
    var response = await client.create(this.threadId, this.collectionName, [value]);
    value._id = response[0];
    return value;
  }

  async createMany(values: T[]) {
    let client = await this.getClient();
    var response = await client.create(this.threadId, this.collectionName, values);
    return values.map((item, index) => {
      item._id = response[index];
      return item;
    });
  }

  async save(value: T): Promise<T> {
    let client = await this.getClient();
    await client.save(this.threadId, this.collectionName, [value]);
    return value;
  }

  async saveMany(values: T[]): Promise<T[]> {
    let client = await this.getClient();
    await client.save(this.threadId, this.collectionName, values);
    return values;
  }

  async createOrSave(value: T): Promise<T> {
    let client = await this.getClient();
    try {
      return await this.create(value);
    }
    catch (e) {
      if (e.message == "can't create already existing instance")
        return await this.save(value);
      throw e;
    }
  }

  async createOrSaveMany(values: T[]): Promise<T[]> {
    let client = await this.getClient();
    var updates: T[] = [];
    var creates: T[] = [];
    for (let val of values) {
      if (val._id && await client.has(this.threadId, this.collectionName, [val._id])) updates.push(val);
      else creates.push(val);
    }
    let updateAsync = this.saveMany(updates);
    let createAsync = this.createMany(creates);
    let result = await Promise.all([updateAsync, createAsync]);
    return [...result[0], ...result[1]];
  }

  async delete(value: T) {
    this.deleteManyByIds([value._id]);
  }

  async deleteMany(values: T[]) {
    this.deleteManyByIds(values.map(x => x._id));
  }

  async deleteById(value: string) {
    let client = await this.getClient();
    await client.delete(this.threadId, this.collectionName, [value]);
  }

  async deleteManyByIds(values: string[]) {
    let client = await this.getClient();
    await client.save(this.threadId, this.collectionName, values);
  }

  async observeUpdate(actionTypes: string[], id: string, callback: any) {
    let client = await this.getClient();
    client.listen(this.threadId, [{
      collectionName: this.collectionName,
      instanceID: id,
      actionTypes: actionTypes
    }], callback)
  };
}
