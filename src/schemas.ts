// import {
//   GraphQLID,
//   GraphQLList,
//   GraphQLObjectType,
//   GraphQLSchema,
//   GraphQLString,
//   GraphQLBoolean,
// } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Result } from "interface-datastore";
import { db } from "./textileThreads";
import { JSONSchema7 } from "json-schema";
import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLString, Thunk, GraphQLFieldConfigMap, GraphQLSchema, GraphQLID, GraphQLBoolean, GraphQLList, getIntrospectionQuery, GraphQLNonNull } from "graphql";
import { type } from "os";
let pluralize = require('pluralize');
import { Collection } from "@textile/threads-database";

export const pubsub = new PubSub();
export async function toArray<T>(iterator: AsyncIterable<Result<T>>): Promise<T[]> {
  const arr = Array<T>();
  for await (const entry of iterator) {
    arr.push(entry.value);
  }
  return arr;
}
export interface Quant {
  ID: string;
  name: string;
  icon: string;
  jsonSchema: string;
  collectionName: string;
}
export const QuantSchema: JSONSchema7 = {
  $id: "https://example.com/quant.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Library",
  type: "object",
  required: ["ID"],
  properties: {
    ID: {
      type: "string",
      description: "The instance's id.",
    },
    name: {
      type: "string",
      description: "name for displaying in views"
    },
    icon: {
      type: "string",
      description: "icon for displaying in views"
    },
    jsonSchema: {
      type: "string",
      description: "json-schema as string registering in textile"
    },
    collectionName: {
      type: "string",
      description: "name for register schema in threadDB"
    }
  }
};
export const LibrarySchema: JSONSchema7 = {
  $id: "https://example.com/person.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Library",
  type: "object",
  required: ["ID"],
  properties: {
    ID: {
      type: "string",
      description: "The instance's id.",
    },
    name: {
      type: "string",
      description: "Branch Name",
    },
  },
};
export const BookSchema: JSONSchema7 = {
  $id: "https://example.com/person.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Book",
  type: "object",
  required: ["ID"],
  properties: {
    ID: {
      type: "string",
      description: "The instance's id.",
    },
    name: {
      type: "string",
      description: "The book title",
    },
    // authors: {
    //   type: "array",
    //   description: "The author. [many to many]",
    // },
    // libraryId: {
    //   type: "string",
    //   description: "The Library the book belongs to",
    // },
  },
};
export const AuthorSchema: JSONSchema7 = {
  $id: "https://example.com/person.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Author",
  type: "object",
  required: ["ID"],
  properties: {
    ID: {
      type: "string",
      description: "The instance's id.",
    },
    name: {
      type: "string",
      description: "The book title",
    },

    samuel: {
      type: "string",
      description: "The book title",
    },
  },
};

export const TomatoSchema: JSONSchema7 = {
  $id: "https://example.com/person.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Tomato",
  type: "object",
  required: ["ID"],
  properties: {
    ID: {
      type: "string",
      description: "The instance's id.",
    },
    name: {
      type: "string",
      description: "The book title",
    },

    samuel: {
      type: "string",
      description: "The book title",
    },
  },
};

// export const AuthorType = new GraphQLObjectType({
//   fields: () => ({
//     ID: { type: GraphQLID },
//     books: {
//       resolve: async (parent: Author) =>
//         toArray(await BookCollection.find({ authorId: parent.ID })),
//       type: GraphQLList(BookType),
//     },
//     name: {
//       type: GraphQLString,
//     },
//   }),
//   name: "Author",
// });

// export const LibraryType = new GraphQLObjectType({
//   fields: () => ({
//     ID: { type: GraphQLString },
//     books: {
//       resolve: async (parent: Library) =>
//         toArray(await BookCollection.find({ libraryId: parent.ID })),
//       type: GraphQLList(BookType),
//     },
//     name: { type: GraphQLString },
//   }),
//   name: "Library",
// });

// export const BookType = new GraphQLObjectType({
//   fields: () => ({
//     ID: { type: GraphQLString },
//     author: {
//       resolve: async (parent: Book) =>
//         await AuthorCollection.findById(parent.authorId),
//       type: AuthorType,
//     },
//     library: {
//       resolve: async (parent: Book) =>
//         await LibraryCollection.findById(parent.libraryId),
//       type: BookType,
//     },
//     name: { type: GraphQLString },
//   }),
//   name: "Book",
// });

export async function getSchema() {
  let quantCollection = db.collections.get("Quant") as Collection<Quant>;
  var quanta = await toArray(await quantCollection.find());
  let map = getQuantTypeMap(quanta);

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      fields: getQueries(map),
      name: "query",
    }),
    mutation: new GraphQLObjectType({
      fields: getMutations(map),
      name: "mutation"
    }),
    subscription: new GraphQLObjectType({
      fields: getSubscriptions(map),
      name: "subscription"
    })
  });
  return schema;
}
//   subscription: new GraphQLObjectType({
//     fields: {
//       authors: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(AUTHOR_CHANGED),
//         type: GraphQLList(AuthorType),
//       },

function getSubscriptions(map: Map<Quant, GraphQLObjectType>): Thunk<GraphQLFieldConfigMap<any, any>> {
  var subscriptions: Thunk<GraphQLFieldConfigMap<any, any>> = {};
  map.forEach((type, quant) => {
    let collection = db.collections.get(quant.collectionName) as Collection;

    subscriptions[pluralize(quant.name)] = {
      type: GraphQLList(type),
      subscribe: async () => pubsub.asyncIterator(quant.collectionName + "_changed"),
      resolve: async () => await toArray(await collection.find())
    };
    subscriptions[quant.name + "Added"] = {
      type: type,
      subscribe: async () => pubsub.asyncIterator(quant.collectionName + "_added"),
      resolve: async (id: string) => await toArray(await collection.findById(id))
    };
    subscriptions[quant.name + "Updated"] = {
      type: type,
      subscribe: async () => pubsub.asyncIterator(quant.collectionName + "_updated"),
      resolve: async (id: string) => await toArray(await collection.findById(id))
    };
    subscriptions[quant.name + "Deleted"] = {
      type: GraphQLID,
      subscribe: async () => pubsub.asyncIterator(quant.collectionName + "_deleted"),
      resolve: async (id: string) => id
    };
  })
  return subscriptions;
}

function getQueries(map: Map<Quant, GraphQLObjectType>): Thunk<GraphQLFieldConfigMap<any, any>> {
  var queries: Thunk<GraphQLFieldConfigMap<any, any>> = {};
  map.forEach((type, quant) => {
    let collection = db.collections.get(quant.collectionName) as Collection;
    queries[pluralize(quant.name)] = {
      type: GraphQLList(type),
      resolve: async () => await toArray(await collection.find())
    };
  })
  return queries;
}

//       addBook: {
//         args: {
//           authorId: { type: GraphQLString },
//           libraryId: { type: GraphQLString },
//           name: { type: GraphQLString },
//         },
//         resolve: async (root: any, { name, authorId, libraryId }) => {
//           const book = new BookCollection({ name, authorId, libraryId });
//           await book.save();
//           return book;
//         },
//         type: BookType,
//       },
function getMutations(map: Map<Quant, GraphQLObjectType>): Thunk<GraphQLFieldConfigMap<any, any>> {
  var mutations: Thunk<GraphQLFieldConfigMap<any, any>> = {};
  map.forEach((type, quant) => {
    let collection = db.collections.get(quant.collectionName) as Collection<any>;
    let schema = JSON.parse(quant.jsonSchema);
    let args = getArguments(schema);
    mutations[`add${quant.name}`] = {
      args,
      resolve: async (root: any, data: any) => {
        var entity = await new collection(data);
        console.log(data);

        await collection.insert(entity);
        return entity;
      },
      type
    };
    mutations[`update${quant.name}`] = {
      args,
      resolve: async (root: any, data: any) => {
        var entity = await new collection(data);
        await entity.save();
        return entity;
      },
      type
    };
    mutations[`addOrUpdate${quant.name}`] = {
      args,
      resolve: async (root: any, data: any) => {
        var entity = await new collection(data);
        if (entity.ID)
          await entity.save();
        else
          await collection.insert(entity);
        return entity;
      },
      type
    };
    mutations[`delete${quant.name}`] = {
      args: { ID: { type: GraphQLID } },
      resolve: async (root: any, ID: any) => {
        try {
          collection.delete(ID);
          return true;

        }
        catch (e) {
          return false;
        }
      },
      type: GraphQLBoolean
    };
  })
  return mutations;
}
function getArguments(schema: JSONSchema7) {
  var args = {};
  if (schema.properties)
    Object.keys(schema.properties).forEach(key => {
      args[key] = {
        type: GraphQLString
      }
    })
  return args;
}
function getQuantTypeMap(quanta: Quant[]): Map<Quant, GraphQLObjectType<any, any>> {
  var map: Map<Quant, GraphQLObjectType<any, any>> = new Map();
  quanta.forEach(quant => {
    map.set(quant, new GraphQLObjectType({
      fields: getFields(quant),
      name: quant.name
    }));
  })
  return map;
}

function getFields(quant: Quant): Thunk<GraphQLFieldConfigMap<any, any>> {
  var schema: JSONSchema7 = JSON.parse(quant.jsonSchema);
  var fields: Thunk<GraphQLFieldConfigMap<any, any>> = {};

  if (schema.properties) {
    let properties = Object.keys(schema.properties);
    properties.forEach(property => {
      fields[property] = { type: GraphQLString }
    });
  }
  return fields;
}
//   subscription: new GraphQLObjectType({
//     fields: {
//       authors: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(AUTHOR_CHANGED),
//         type: GraphQLList(AuthorType),
//       },
//       books: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(BOOK_CHANGED),
//         type: GraphQLList(BookType),
//       },
//       libraries: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(LIBRARY_CHANGED),
//         type: GraphQLList(LibraryType),
//       },
//       authorCreate: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(AUTHOR_CREATE),
//         type: AuthorType,
//       },
//       bookCreate: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(BOOK_CREATE),
//         type: BookType,
//       },
//       libraryCreate: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(LIBRARY_CREATE),
//         type: LibraryType,
//       },
//       authorSave: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(AUTHOR_SAVE),
//         type: AuthorType,
//       },
//       bookSave: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(BOOK_SAVE),
//         type: BookType,
//       },
//       librarySave: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(LIBRARY_SAVE),
//         type: LibraryType,
//       },
//       authorDelete: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(AUTHOR_DELETE),
//         type: GraphQLID,
//       },
//       bookDelete: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(BOOK_DELETE),
//         type: GraphQLID,
//       },
//       libraryDelete: {
//         resolve: async (payload, args, context, info) => payload,
//         subscribe: async () => pubsub.asyncIterator(LIBRARY_DELETE),
//         type: GraphQLID,
//       },
//     },
//     name: "subscription",
//   }),
// });
