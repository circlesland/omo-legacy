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
  TomatoSchema,
} from "./schemas";
export let db: Database;
export let QuantCollection: Collection<Quant>;
export let Collections: Map<string, Collection<any>>;
export async function initDB(seed: Boolean): Promise<void> {
  const store = new LevelDatastore("db/" + uuid.v4() + ".db");
  db = new Database(store);
  await db.open();

  if (!db.collections.has("Quant")) {
    QuantCollection = await db.newCollection<Quant>("Quant", QuantSchema);
    if (seed) {
      await seedDB(db);
    }
  } else {
    QuantCollection = db.collections.get("Quant") as Collection<Quant>;
  }
  Collections = db.collections;
  // Subsriptions
  db.on("**", async (update) => pubsub.publish(update.collection.toLowerCase() + "_save", {
    type: update.event.type,
    collection: db.collections.get(update.collection),
    id: update.id
  }));
  console.log("DB initialised");
}

export async function seedDB(db: Database): Promise<void> {
  const quanta = [
    { name: "Author", icon: "fa-book", jsonSchema: JSON.stringify(AuthorSchema), collectionName: uuid.v4() },
    { name: "Book", icon: "fa-book", jsonSchema: JSON.stringify(BookSchema), collectionName: uuid.v4() },
    { name: "Library", icon: "fa-book", jsonSchema: JSON.stringify(LibrarySchema), collectionName: uuid.v4() },
  ];
  await quanta.forEach(async quant => await db.newCollection(quant.collectionName, JSON.parse(quant.jsonSchema)));
  await QuantCollection.save(...quanta.map(quant => new QuantCollection(quant)));
}
