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
import { TextileThread } from "./textileThreads";
const escapeStringRegexp = require('escape-string-regexp');

let pluralize = require('pluralize');
let app;
var textileThread = TextileThread.getInstance(null);
textileThread.initDB(true).then(async () => {
  window["escape"] = escapeStringRegexp;
  window["pluralize"] = pluralize;
  window["graphql"] = async (query) => graphql(await getSchema(), query);
  window["subscribe"] = async (query) =>
    (await subscribe({
      schema: await getSchema(),
      document: parse(query),
      rootValue: "data",
    })) as AsyncIterableIterator<ExecutionResult>;
  window['printSchema'] = printSchema;
  window['getSchema'] = getSchema;
  window["schema"] = async () => printSchema(await getSchema());

  app = new App({
    target: document.body,
  });
});
window['thread'] = textileThread;

export default app;
