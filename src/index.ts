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

let app;

initDB(true).then(() => {
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
});

export default app;
