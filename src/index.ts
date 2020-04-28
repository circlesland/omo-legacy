import "./styles/index.scss";
import App from "./App.svelte";

import { graphql, printSchema, subscribe, parse, ExecutionResult } from 'graphql';
import { schema } from './schemas';
import { initDB, seedDB, BookCollection } from './textileThreads';
console.clear();

let app = new App({
	target: document.body,
	props: {
		world: "World 🌎"
	}
});

initDB().then(() => seedDB().then(() => {
	// DemoProgram();
	window['graphql'] = (query) => graphql(schema, query);
}));


export default app;
