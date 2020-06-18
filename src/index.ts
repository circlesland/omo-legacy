import "./styles/index.scss";
import App from "./App.svelte";
/*import {
  graphql,
  printSchema,
  subscribe,
  parse,
  ExecutionResult,
} from "graphql";
import { getSchema } from "./schemas";
import { initDB, db } from "./textileThreads";
const escapeStringRegexp = require('escape-string-regexp');*/

// let pluralize = require('pluralize');
let app;
// window['printSchema'] = printSchema;
// initDB(true).then(async () => {
//   window["db"] = db;
//   window["escape"] = escapeStringRegexp;
//   window["pluralize"] = pluralize;
//   window["graphql"] = async (query) => graphql(await getSchema(), query);
//   window["subscribe"] = async (query) =>
//     (await subscribe({
//       schema: await getSchema(),
//       document: parse(query),
//       rootValue: "data",
//     })) as AsyncIterableIterator<ExecutionResult>;
//   window["schema"] = async () => printSchema(await getSchema());
  app = new App({
    target: document.body,
  });
// });

export default app;
