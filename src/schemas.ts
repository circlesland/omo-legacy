import {
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLBoolean,
} from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Result } from "interface-datastore";
import {
  AuthorCollection,
  BookCollection,
  LibraryCollection,
} from "./textileThreads";
import { JSONSchema7 } from "json-schema";

export const pubsub = new PubSub();
const LIBRARY_CHANGED = "library_changed";
const AUTHOR_CHANGED = "author_changed";
const BOOK_CHANGED = "book_changed";

const LIBRARY_SAVE = "library_save";
const AUTHOR_SAVE = "author_save";
const BOOK_SAVE = "book_save";

const LIBRARY_CREATE = "library_create";
const AUTHOR_CREATE = "author_create";
const BOOK_CREATE = "book_create";

const LIBRARY_DELETE = "library_delete";
const AUTHOR_DELETE = "author_delete";
const BOOK_DELETE = "book_delete";

export async function toArray<T>(iterator: AsyncIterable<Result<T>>): Promise<T[]> {
  const arr = Array<T>();
  for await (const entry of iterator) {
    arr.push(entry.value);
  }
  return arr;
}

export let LibrarySchema: JSONSchema7;
export let BookSchema: JSONSchema7;
export let AuthorSchema: JSONSchema7;

LibrarySchema = {
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
BookSchema = {
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
    authorId: {
      type: "string",
      description: "The author.",
    },
    libraryId: {
      type: "string",
      description: "The Library the book belongs to",
    },
  },
};
AuthorSchema = {
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
  },
};

export interface Library {
  ID: string;
  name: string;
}

export interface Book {
  ID: string;
  name: string;
  authorId: string;
  libraryId: string;
}

export interface Author {
  ID: string;
  name: string;
}

export const AuthorType = new GraphQLObjectType({
  fields: () => ({
    ID: { type: GraphQLID },
    books: {
      resolve: async (parent: Author) =>
        toArray(await BookCollection.find({ authorId: parent.ID })),
      type: GraphQLList(BookType),
    },
    name: {
      type: GraphQLString,
    },
  }),
  name: "Author",
});

export const LibraryType = new GraphQLObjectType({
  fields: () => ({
    ID: { type: GraphQLString },
    books: {
      resolve: async (parent: Library) =>
        toArray(await BookCollection.find({ libraryId: parent.ID })),
      type: GraphQLList(BookType),
    },
    name: { type: GraphQLString },
  }),
  name: "Library",
});

export const BookType = new GraphQLObjectType({
  fields: () => ({
    ID: { type: GraphQLString },
    author: {
      resolve: async (parent: Book) =>
        await AuthorCollection.findById(parent.authorId),
      type: AuthorType,
    },
    library: {
      resolve: async (parent: Book) =>
        await LibraryCollection.findById(parent.libraryId),
      type: BookType,
    },
    name: { type: GraphQLString },
  }),
  name: "Book",
});

export const schema = new GraphQLSchema({
  mutation: new GraphQLObjectType({
    fields: {
      addAuthor: {
        args: {
          name: { type: GraphQLString },
        },
        resolve: async (root: any, { name }) => {
          const author = new AuthorCollection({ name });
          await author.save();
          return author;
        },
        type: AuthorType,
      },
      addBook: {
        args: {
          authorId: { type: GraphQLString },
          libraryId: { type: GraphQLString },
          name: { type: GraphQLString },
        },
        resolve: async (root: any, { name, authorId, libraryId }) => {
          const book = new BookCollection({ name, authorId, libraryId });
          await book.save();
          return book;
        },
        type: BookType,
      },
      addLibrary: {
        args: {
          name: { type: GraphQLString },
        },
        resolve: async (root: any, { name }) => {
          const library = new LibraryCollection({ name });
          await library.save();
          return library;
        },
        type: LibraryType,
      },
      saveAuthor: {
        args: {
          ID: { type: GraphQLID },
          name: { type: GraphQLString },
        },
        resolve: async (root: any, { ID, name }) => {
          let author = await AuthorCollection.findById(ID);
          if (name !== undefined) author.name = name;
          await AuthorCollection.save(author);
          return author;
        },
        type: AuthorType,
      },
      saveBook: {
        args: {
          ID: { type: GraphQLID },
          name: { type: GraphQLString },
          authorId: { type: GraphQLString },
          libraryId: { type: GraphQLString }
        },
        resolve: async (root: any, { ID, name, authorId, libraryId }) => {
          let book = await BookCollection.findById(ID);
          if (name !== undefined) book.name = name;
          if (authorId !== undefined) book.authorId = authorId;
          if (libraryId !== undefined) book.libraryId = libraryId;
          await BookCollection.save(book);
          return book;
        },
        type: BookType,
      },
      saveLibrary: {
        args: {
          ID: { type: GraphQLID },
          name: { type: GraphQLString },
        },
        resolve: async (root: any, { ID, name }) => {
          let library = await BookCollection.findById(ID);
          if (name !== undefined) library.name = name;
          await LibraryCollection.save(library);
          return library;
        },
        type: LibraryType,
      },

      deleteAuthor: {
        args: {
          ID: { type: GraphQLID },
        },
        resolve: async (root: any, { ID }) => {
          await AuthorCollection.delete(ID)
            .then(() => true)
            .catch(() => false);
        },
        type: GraphQLBoolean,
      },
      deleteBook: {
        args: {
          ID: { type: GraphQLID },
        },
        resolve: async (root: any, { ID }) => {
          await BookCollection.delete(ID)
            .then(() => true)
            .catch(() => false);
        },
        type: GraphQLBoolean,
      },
      deleteLibrary: {
        args: {
          ID: { type: GraphQLID },
        },
        resolve: async (root: any, { ID }) => {
          await LibraryCollection.delete(ID)
            .then(() => true)
            .catch(() => false);
        },
        type: GraphQLBoolean,
      },
    },
    name: "mutation",
  }),
  query: new GraphQLObjectType({
    fields: {
      authors: {
        resolve: async () => toArray(AuthorCollection.find()),
        type: GraphQLList(AuthorType),
      },
      books: {
        resolve: async () => toArray(BookCollection.find()),
        type: GraphQLList(BookType),
      },
      libraries: {
        resolve: async () => toArray(LibraryCollection.find()),
        type: GraphQLList(LibraryType),
      },
    },
    name: "query",
  }),
  subscription: new GraphQLObjectType({
    fields: {
      authors: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(AUTHOR_CHANGED),
        type: GraphQLList(AuthorType),
      },
      books: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(BOOK_CHANGED),
        type: GraphQLList(BookType),
      },
      libraries: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(LIBRARY_CHANGED),
        type: GraphQLList(LibraryType),
      },
      authorCreate: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(AUTHOR_CREATE),
        type: AuthorType,
      },
      bookCreate: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(BOOK_CREATE),
        type: BookType,
      },
      libraryCreate: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(LIBRARY_CREATE),
        type: LibraryType,
      },
      authorSave: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(AUTHOR_SAVE),
        type: AuthorType,
      },
      bookSave: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(BOOK_SAVE),
        type: BookType,
      },
      librarySave: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(LIBRARY_SAVE),
        type: LibraryType,
      },
      authorDelete: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(AUTHOR_DELETE),
        type: GraphQLID,
      },
      bookDelete: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(BOOK_DELETE),
        type: GraphQLID,
      },
      libraryDelete: {
        resolve: async (payload, args, context, info) => payload,
        subscribe: async () => pubsub.asyncIterator(LIBRARY_DELETE),
        type: GraphQLID,
      },
    },
    name: "subscription",
  }),
});
