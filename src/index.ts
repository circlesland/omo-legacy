import "./styles/index.scss";
import App from "./App.svelte";

import {
  graphql,
  printSchema,
  subscribe,
  parse,
  ExecutionResult,
} from "graphql";
import { getSchema } from "./schemas";
import { initDB, Collections, db } from "./textileThreads";

let app;
window['printSchema'] = printSchema;
initDB(true).then(async () => {
  window["db"] = db;
  var schema = await getSchema();
  window["graphql"] = (query) => graphql(schema, query);
  // // window["subscribe"] = async (query) =>
  // //   (await subscribe({
  // //     schema,
  // //     document: parse(query),
  // //     rootValue: "data",
  // //   })) as AsyncIterableIterator<ExecutionResult>;
  window["schema"] = printSchema(schema);
  // // window["seed"] = seedDB;
  // console.log("app");
  app = new App({
    target: document.body,
  });
});

export default app;
