import "./styles/index.scss";
import App from "./App.svelte";

import {
  graphql,
  printSchema,
  subscribe,
  parse,
  ExecutionResult,
} from "graphql";
import { schema } from "./schemas";
import { initDB, seedDB, BookCollection } from "./textileThreads";
console.clear();

let app;

initDB().then(() =>
  seedDB().then(() => {
    // DemoProgram();
    window["graphql"] = (query) => graphql(schema, query);
    window["subscribe"] = async (query) =>
      (await subscribe({
        schema,
        document: parse(query),
        rootValue: "data",
      })) as AsyncIterableIterator<ExecutionResult>;
    window["schema"] = printSchema(schema);
    console.log("app");
    app = new App({
      target: document.body,
    });

    test();
  })
);

async function test() {
  // let query = '{ libraries {branch books {title}} }';
  // console.log("ALL Libraries", await graphql(schema, query))
  // query = '{books {title}}';
  // console.log("ALL BOOKS", await graphql(schema, query))
  // query = 'mutation {addBook(title:"test"){title ID}}'
  // let book = await graphql(schema, query);
  // book = await graphql(schema, query);
  // console.log("book added", book);
  // query = '{books {title}}';
  // console.log("ALL BOOKS", await graphql(schema, query))
}
export default app;
