(global as any).WebSocket = require("isomorphic-ws");
import { Collection, Database } from "@textile/threads-database";
import LevelDatastore from "datastore-level";
import * as uuid from "uuid";
import {
  QuantSchema,
  Quant,
  pubsub,
  LibrarySchema,
  BookSchema,
  AuthorSchema,
} from "./schemas";
import { Op } from "@textile/threads-store";
export var db: Database;

export async function initDB(seed: Boolean): Promise<void> {
  // const store = new LevelDatastore("db/" + uuid.v4() + ".db");
  const store = new LevelDatastore("db/static3.db");
  db = new Database(store);
  await db.open();

  if (!db.collections.has("Quant")) {
    await seedDB(db, seed);
  }
  // Subsriptions
  db.on("**", async (update) => {
    let postfix = "";
    switch (update.event.type) {
      case Op.Type.Create:
        postfix = "added";
        break;
      case Op.Type.Save:
        postfix = "updated";
        break;
      case Op.Type.Delete:
        postfix = "deleted";
        break;
    }

    pubsub.publish(update.collection + "_" + postfix, { id: update.id });
    pubsub.publish(update.collection + "_changed", { id: update.id });
    pubsub.publish(update.id + "_" + postfix, { id: update.id });
    pubsub.publish(update.id + "_changed", { id: update.id });
  });
  console.log("DB initialised");
}

export async function seedDB(db: Database, seed): Promise<void> {
  const quanta: any[] = [
    {
      ID: "78a414b4-8557-4790-a863-9e75a89bfbd8",
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
    await db.newCollection(
      quanta[i].collectionName,
      JSON.parse(quanta[i].jsonSchema)
    );

  let quantCollection = db.collections.get("Quant") as Collection<Quant>;
  await quantCollection.save(...quanta.map((quant) => quantCollection(quant)));
}
