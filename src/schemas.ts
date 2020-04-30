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
import {
  Collections, QuantCollection
} from "./textileThreads";
import { JSONSchema7 } from "json-schema";
import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLString, Thunk, GraphQLFieldConfigMap, GraphQLSchema, GraphQLID, GraphQLBoolean, GraphQLList, getIntrospectionQuery } from "graphql";
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

export const BookType = new GraphQLObjectType({
  fields: () => ({
    ID: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
  name: "Book",
});
function getBooks(): Thunk<GraphQLFieldConfigMap<any, any>> {
  return {
    books: {
      resolve: async () => null,
      type: GraphQLList(BookType),
    }
  };
}
export async function getSchema() {
  var quanta = await toArray(await QuantCollection.find());
  let map = getQuantTypeMap(quanta);

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      fields: getQueries(map),
      name: "query",
    })
  });

  const schema2 = new GraphQLSchema({
    query: new GraphQLObjectType({
      fields: getBooks(),
      name: "query",
    })
  });

  return schema;
}

function getQueries(map: Map<Quant, GraphQLObjectTypeConfig<any, any>>): Thunk<GraphQLFieldConfigMap<any, any>> {
  var queries: Thunk<GraphQLFieldConfigMap<any, any>> = {};
  map.forEach((typeConfig, quant) => {
    let collection = Collections.get(quant.collectionName) as Collection;
    var type = new GraphQLObjectType(typeConfig);
    queries[pluralize(quant.name)] = {
      type: GraphQLList(type),
      resolve: async () => { collection.find() }
    };
  })
  return queries;
}

function getQuantTypeMap(quanta: Quant[]): Map<Quant, GraphQLObjectTypeConfig<any, any>> {
  var map: Map<Quant, GraphQLObjectTypeConfig<any, any>> = new Map();

  quanta.forEach(quant => {
    map.set(quant, {
      fields: getFields(quant),
      name: quant.name
    });
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
// export const schema = new GraphQLSchema({
//   mutation: new GraphQLObjectType({
//     fields: {
//       addAuthor: {
//         args: {
//           name: { type: GraphQLString },
//         },
//         resolve: async (root: any, { name }) => {
//           const author = new AuthorCollection({ name });
//           await author.save();
//           return author;
//         },
//         type: AuthorType,
//       },
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
//       addLibrary: {
//         args: {
//           name: { type: GraphQLString },
//         },
//         resolve: async (root: any, { name }) => {
//           const library = new LibraryCollection({ name });
//           await library.save();
//           return library;
//         },
//         type: LibraryType,
//       },
//       saveAuthor: {
//         args: {
//           ID: { type: GraphQLID },
//           name: { type: GraphQLString },
//         },
//         resolve: async (root: any, { ID, name }) => {
//           let author = await AuthorCollection.findById(ID);
//           if (name !== undefined) author.name = name;
//           await AuthorCollection.save(author);
//           return author;
//         },
//         type: AuthorType,
//       },
//       saveBook: {
//         args: {
//           ID: { type: GraphQLID },
//           name: { type: GraphQLString },
//           authorId: { type: GraphQLString },
//           libraryId: { type: GraphQLString }
//         },
//         resolve: async (root: any, { ID, name, authorId, libraryId }) => {
//           let book = await BookCollection.findById(ID);
//           if (name !== undefined) book.name = name;
//           if (authorId !== undefined) book.authorId = authorId;
//           if (libraryId !== undefined) book.libraryId = libraryId;
//           await BookCollection.save(book);
//           return book;
//         },
//         type: BookType,
//       },
//       saveLibrary: {
//         args: {
//           ID: { type: GraphQLID },
//           name: { type: GraphQLString },
//         },
//         resolve: async (root: any, { ID, name }) => {
//           let library = await LibraryCollection.findById(ID);
//           if (name !== undefined) library.name = name;
//           await LibraryCollection.save(library);
//           return library;
//         },
//         type: LibraryType,
//       },

//       deleteAuthor: {
//         args: {
//           ID: { type: GraphQLID },
//         },
//         resolve: async (root: any, { ID }) => {
//           await AuthorCollection.delete(ID)
//             .then(() => true)
//             .catch(() => false);
//         },
//         type: GraphQLBoolean,
//       },
//       deleteBook: {
//         args: {
//           ID: { type: GraphQLID },
//         },
//         resolve: async (root: any, { ID }) => {
//           await BookCollection.delete(ID)
//             .then(() => true)
//             .catch(() => false);
//         },
//         type: GraphQLBoolean,
//       },
//       deleteLibrary: {
//         args: {
//           ID: { type: GraphQLID },
//         },
//         resolve: async (root: any, { ID }) => {
//           await LibraryCollection.delete(ID)
//             .then(() => true)
//             .catch(() => false);
//         },
//         type: GraphQLBoolean,
//       },
//     },
//     name: "mutation",
//   }),
//   query: new GraphQLObjectType({
//     fields: {
//       authors: {
//         resolve: async () => toArray(AuthorCollection.find()),
//         type: GraphQLList(AuthorType),
//       },
//       books: {
//         resolve: async () => toArray(BookCollection.find()),
//         type: GraphQLList(BookType),
//       },
//       libraries: {
//         resolve: async () => toArray(LibraryCollection.find()),
//         type: GraphQLList(LibraryType),
//       },
//     },
//     name: "query",
//   }),
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
