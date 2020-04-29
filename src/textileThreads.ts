(global as any).WebSocket = require("isomorphic-ws");
import { Collection, Database } from "@textile/threads-database";
import { Op } from "@textile/threads-store";
import LevelDatastore from "datastore-level";
import * as uuid from "uuid";
import {
  Author,
  AuthorSchema,
  Book,
  BookSchema,
  Library,
  LibrarySchema,
  pubsub,
  toArray,
} from "./schemas";

export let LibraryCollection: Collection<Library>;
export let BookCollection: Collection<Book>;
export let AuthorCollection: Collection<Author>;

export async function initDB(seed: Boolean): Promise<void> {
  const store = new LevelDatastore("db/db.db");
  const db = new Database(store);
  await db.open();
  console.log("COLLECTIONS", db.collections);
  if (!db.collections.has("Book")) {
    // First time created
    LibraryCollection = await db.newCollection<Library>("Library", LibrarySchema);
    BookCollection = await db.newCollection<Book>("Book", BookSchema);
    AuthorCollection = await db.newCollection<Author>("Author", AuthorSchema);
    if (seed) {
      await seedDB();
    }
  }
  else {
    LibraryCollection = db.collections.get("Library") as Collection<Library>;
    BookCollection = db.collections.get("Book") as Collection<Book>;
    AuthorCollection = db.collections.get("Author") as Collection<Author>;
  }

  // Subsriptions
  db.on("**", async (update) => {
    console.info(update);
    const collection = db.collections.get(update.collection);
    if (collection) {
      switch (update.event.type) {
        case Op.Type.Create:
          let create: any;
          create = {};
          create[
            update.collection.toLowerCase() + "Create"
          ] = await collection.findById(update.id);
          pubsub.publish(update.collection.toLowerCase() + "_create", create);
          break;
        case Op.Type.Save:
          let save: any;
          save = {};
          save[
            update.collection.toLowerCase() + "Save"
          ] = await collection.findById(update.id);
          pubsub.publish(update.collection.toLowerCase() + "_save", save);
          break;
        case Op.Type.Delete:
          pubsub.publish(
            update.collection.toLowerCase() + "_delete",
            update.id
          );
          break;
      }
      pubsub.publish(
        update.collection.toLowerCase() + "_changed",
        await toArray(collection.find())
      );
    }
  });

  console.log("DB initialised");
}

export async function seedDB(): Promise<void> {
  const downtown = new LibraryCollection({ name: "downtown" });
  await downtown.save();

  const riverside = new LibraryCollection({ name: "riverside" });
  await riverside.save();

  const rowling = new AuthorCollection({ name: "J.K. Rowling" });
  await rowling.save();

  const crichton = new AuthorCollection({ name: "Michael Crichton" });
  await crichton.save();

  const harryPotter = new BookCollection({
    name: "Harry Potter and the Chamber of Secrets",
    authorId: rowling.ID,
    libraryId: downtown.ID,
  });
  await harryPotter.save();

  const jurassicPark = new BookCollection({
    name: "Jurassic Park ",
    authorId: crichton.ID,
    libraryId: riverside.ID,
  });
  jurassicPark.save();
  console.log("DB seeded");
}
