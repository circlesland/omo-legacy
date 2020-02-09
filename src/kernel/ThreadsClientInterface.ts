import Client, { Entity, EntityList, JSONQuery } from '@textile/threads-client';
// tslint:disable-next-line: no-submodule-imports no-implicit-dependencies
import { NewStoreReply } from '@textile/threads-client-grpc/api_pb';

export default class ThreadsClientInterface {
  public serverConnected: boolean;
  public localConnected: boolean;

  private local: Client;
  private server: Client;
  private serverStoreId: string;
  private localStoreId: string;

  constructor() {
    this.server = new Client({ host: 'http://81.169.194.192:7006' });
    this.local = new Client({ host: 'http://localhost:6007' });
    this.serverConnected = false;
    this.localConnected = false;
  }

  public async start(): Promise<void> {
    this.serverStoreId = 'af8fd66c-3cbd-49b9-abbc-2811dc870388';
    this.localStoreId = await this.getLocalStoreId();

    try {
      await this.server.start(this.serverStoreId);
      this.serverConnected = true;
    } catch (err) {
      switch (err.message) {
        case 'Response closed without headers':
          break;
        default:
          throw err;
      }
    }
    try {
      await this.local.start(this.localStoreId);
      this.localConnected = true;
    } catch (err) {
      switch (err.message) {
        case 'Response closed without headers':
          if (!this.serverConnected) {
            alert('Server and Local Threads instance not available!');
          }
          break;
        default:
          throw err;
      }
    }
  }

  public async newStore(): Promise<NewStoreReply.AsObject> {
    // const localStore = this.local.newStore();
    const serverStore = this.server.newStore();
    console.log(serverStore);
    return serverStore;
  }

  public async modelFind<T = any>(
    storeID: string,
    modelName: string,
    query: JSONQuery
  ): Promise<EntityList<T>> {
    return this.server.modelFind(storeID, modelName, query);
  }

  public async modelFindByID<T = any>(
    storeID: string,
    modelName: string,
    entityID: string
  ): Promise<Entity<T>> {
    return this.server.modelFindByID<T>(storeID, modelName, entityID);
  }

  public listen<T = any>(
    storeID: string,
    modelName: string,
    entityID: string,
    callback: (reply: Entity<T>) => void
  ): void {
    this.server.listen(storeID, modelName, entityID, callback);
  }

  public async modelSave(
    storeID: string,
    modelName: string,
    values: any[]
  ): Promise<void> {
    this.server.modelSave(storeID, modelName, values);
  }

  public modelCreate<T = any>(
    storeID: string,
    modelName: string,
    values: any[]
  ): Promise<EntityList<T>> {
    return this.server.modelCreate(storeID, modelName, values);
  }

  public async registerSchema(
    storeID: string,
    name: string,
    schema: any
  ): Promise<void> {
    try {
      await this.server.registerSchema(storeID, name, schema);
    } catch (err) {
      if (err.message !== 'already registered model') {
        throw err;
      }
    }
  }
  public async modelDelete(
    storeID: string,
    modelName: string,
    entityIDs: string[]
  ): Promise<void> {
    return this.server.modelDelete(storeID, modelName, entityIDs);
  }

  public async modelHas(
    storeID: string,
    modelName: string,
    entityIDs: string[]
  ): Promise<boolean> {
    return this.server.modelHas(storeID, modelName, entityIDs);
  }

  private async getLocalStoreId(): Promise<string> {
    let id = window.localStorage.getItem('LocalStoreId');
    if (id === null) {
      id = (await this.local.newStore()).id;
      window.localStorage.setItem('LocalStoreId', id);
    }
    return id;
  }
}
