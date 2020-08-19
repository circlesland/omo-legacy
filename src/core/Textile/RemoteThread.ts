import { KeyInfo, JSONSchema, Client, ThreadID } from "@textile/hub";
import { Instance } from "@textile/threads-store";
import { GetThreadReply } from "@textile/users-grpc/users_pb";
import { isString } from "util";
import { RemoteCollection } from "./RemoteCollection";

export class RemoteThread {
  private collections: RemoteCollection<Instance>[];
  private threadID: ThreadID;

  private constructor(threadId: ThreadID) {
    this.threadID = threadId;
    this.collections = [];
  }

  static async byThreadID(threadId: string): Promise<RemoteThread> {
    var newThreadId = ThreadID.fromString(threadId);
    return new RemoteThread(newThreadId);
  }

  static async init(threadName: any): Promise<RemoteThread> {
    var client = await this.getClient();
    var threadList = (await client.listThreads()).listList;
    if (threadList.some(x => x.name == threadName)) {
      var tr = (threadList.find(x => x.name == threadName) as GetThreadReply.AsObject).id;
      var tid = isString(tr) ? ThreadID.fromString(tr) : ThreadID.fromBytes(tr);
      return new RemoteThread(tid);
    }
    var newThreadId = ThreadID.fromRandom();
    await client.newDB(newThreadId, threadName);
    return new RemoteThread(newThreadId);
  }

  private static async getClient() {
    let remoteAuth: KeyInfo = {
      key: process.env.USER_API_KEY || '',
      secret: process.env.USER_API_SECRET || ''
    };
    return await Client.withKeyInfo(remoteAuth);
  }

  private async getClient() {
    return await RemoteThread.getClient();
  }

  async getInvite() {
    let client = await this.getClient();
    let info = await client.getDBInfo(this.threadID);
    return JSON.stringify(info);
  }

  async hasCollection(collectionName: string): Promise<boolean> {
    var client = await this.getClient();
    try {
      return await client.has(this.threadID, collectionName, []);
    }
    catch (e) {
      if (e.message == "collection not found") return false;
      throw e;

    }
  }

  async createCollection(collectionName: string, schema: JSONSchema) {
    var client = await this.getClient();
    await client.newCollection(this.threadID, collectionName, schema);
  }

  async getCollection<X extends Instance>(collectionName: string): Promise<RemoteCollection<X>> {
    if (this.collections.some(x => x.collectionName == collectionName))
      return this.collections.find(x => x.collectionName == collectionName) as RemoteCollection<X>;
    var remoteCollection = new RemoteCollection<X>(this.threadID, collectionName);
    this.collections.push(remoteCollection);
    return remoteCollection;
  }

  async getOrCreateCollection<X extends Instance>(collectionName: string, schema: JSONSchema): Promise<RemoteCollection<X>> {
    if (!await this.hasCollection(collectionName))
      await this.createCollection(collectionName, schema);
    return await this.getCollection(collectionName);
  }

  async deleteThread() {
    var client = await this.getClient();
    client.deleteDB(this.threadID);
  }
}
