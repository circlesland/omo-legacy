(global as any).WebSocket = require("isomorphic-ws");
import * as uuid from "uuid";
import {
  QuantSchema,
  LibrarySchema,
  BookSchema,
  AuthorSchema,
} from "./schemas";
import { Client, ThreadID } from '@textile/hub';

export class TextileThread {
  collections: Collections;

  async newClientDB(): Promise<Client> {
    const API = process.env.API || undefined
    const client = await Client.withKeyInfo({
      key: process.env.USER_API_KEY || '',
      secret: process.env.USER_API_SECRET || '',
      type: 0,
    }, API)
    return client;
  }

  async getQuanta(): Promise<any[]> {
    var client = await this.newClientDB();
    var quanta = await client.find(this.threadId, "Quant", {});
    return quanta.instancesList;
  }

  private static instance: TextileThread;

  private constructor(threadId) {
    this.threadId = threadId || ThreadID.fromString(process.env.THREADID || '');
    this.collections = new Collections(this);
  }

  threadId: ThreadID;

  static getInstance(threadId?): TextileThread {
    if (!TextileThread.instance) {
      TextileThread.instance = new TextileThread(threadId);
    }
    return TextileThread.instance;
  }




  async initDB(seed: Boolean): Promise<void> {
    let client = await this.newClientDB();
    try {

      if (!await client.has(this.threadId, "Quant", [])) {
        await this.seedDB(seed, client);
      }
    }
    catch (error) {
      if (error.message == "collection not found")
        await this.seedDB(seed, client);
      else
        throw error;
    }
    // Subsriptions
    var quanta = await client.find(this.threadId, "Quant", {});
    quanta.instancesList.forEach(quant => {
      this.createSubscription(client, quant.collectionName, "CREATE", "_added")
      this.createSubscription(client, quant.collectionName, "SAVE", "_updated")
      this.createSubscription(client, quant.collectionName, "DELETE", "_deleted")
      this.createSubscription(client, quant.collectionName, "ALL", "_changed")
    });
    console.log("DB initialised");
  }

  createSubscription(client, collectionName, actionType, pubsub) {
    client.listen(this.threadId, [
      {
        collectionName: collectionName,
        actionTypes: [actionType]
      }
    ],
      (reply, error) => {
        if (reply)
          pubsub.publish(collectionName + pubsub, reply.instance._id)
        if (error)
          console.error(error);
      }
    )
  }

  private async  seedDB(seed, client: Client): Promise<void> {
    const quanta: any[] = [
      {
        _id: "78a414b4-8557-4790-a863-9e75a89bfbd8",
        name: "Quant",
        icon: "fa-book",
        jsonSchema: JSON.stringify(QuantSchema),
        collectionName: "Quant",
      },
    ];

    if (seed)
      quanta.push(
        {
          name: "Author",
          icon: "fa-book",
          jsonSchema: JSON.stringify(AuthorSchema),
          collectionName: uuid.v4(),
        },
        {
          name: "Book",
          icon: "fa-book",
          jsonSchema: JSON.stringify(BookSchema),
          collectionName: uuid.v4(),
        },
        {
          name: "Library",
          icon: "fa-book",
          jsonSchema: JSON.stringify(LibrarySchema),
          collectionName: uuid.v4(),
        }
      );

    for (let i = 0; i < quanta.length; i++)
      await client.newCollection(this.threadId,
        quanta[i].collectionName,
        JSON.parse(quanta[i].jsonSchema)
      );
    await client.create(this.threadId, "Quant", quanta);
  }
}


class Collections {
  threadId: ThreadID;
  textileThread: TextileThread;

  constructor(textileThread: TextileThread) {
    this.threadId = textileThread.threadId;
    this.textileThread = textileThread;
  }
  async has(collectionName: string, IDs: string[]) {
    const client = await this.textileThread.newClientDB();
    return await client.has(this.threadId, collectionName, IDs);
  }

  async newCollection(collectionName, jsonSchema) {
    const client = await this.textileThread.newClientDB();
    await client.newCollection(this.threadId, collectionName, jsonSchema);
  }

  async find(collectionName, query) {
    const client = await this.textileThread.newClientDB();
    return (await client.find(this.threadId, collectionName, query)).instancesList;
  }
  async findById(collectionName, ID) {
    const client = await this.textileThread.newClientDB();
    return (await client.findByID(this.threadId, collectionName, ID)).instance;
  }

  async add(collectionName, data) {
    const client = await this.textileThread.newClientDB();
    return await client.create(this.threadId, collectionName, data);
  }

  async update(collectionName, data) {
    const client = await this.textileThread.newClientDB();
    return await client.save(this.threadId, collectionName, data);
  }

  async delete(collectionName, IDs) {
    const client = await this.textileThread.newClientDB();
    return await client.delete(this.threadId, collectionName, IDs);
  }
}