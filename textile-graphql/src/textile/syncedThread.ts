import { Instance } from "@textile/threads-store";
import { SyncedCollection } from "./syncedCollection";
//import { RemoteThread } from "./remoteThread";
import { LocalThread } from "./localThread";
import { JSONSchema } from "@textile/hub";

export class SyncedThread {
  //private remoteThread: RemoteThread;
  private localThread: LocalThread;

  private constructor(localThread:any/*, remoteThread: RemoteThread*/) {
    this.localThread = localThread;
    //this.remoteThread = remoteThread;
  }

  static async init(threadName:string, threadId: string | undefined): Promise<SyncedThread> {
    var localThread = await LocalThread.init(threadName);
    //var remoteThread = threadId ? await RemoteThread.byThreadID(threadId) : await RemoteThread.init(threadName);
    return new SyncedThread(localThread/*, remoteThread*/);
  }

  async getOrCreateCollection<T extends Instance>(collectionName: string, schema: JSONSchema, awaitSync: boolean = false): Promise<SyncedCollection<T>> {
    if (!await this.localThread.hasCollection(collectionName))
      await this.localThread.createCollection(collectionName, schema);

    /*
    this.remoteThread.hasCollection(collectionName).then(hasCollection => {
      if (!hasCollection)
        this.remoteThread.createCollection(collectionName, schema)
    });
     */

    return await this.getCollection(collectionName);
  }

  async getCollection<T extends Instance>(collectionName: string, awaitSync: boolean = false): Promise<SyncedCollection<T>> {
    return await SyncedCollection.init<T>(collectionName, this.localThread/*, this.remoteThread, awaitSync*/);
  }
}
