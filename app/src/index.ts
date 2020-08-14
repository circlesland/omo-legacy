import App from './App.svelte';
import {Adapter} from "@omo/textile-graphql/dist/adapter"


new Adapter();
const app = new App({
    target: document.body,
});

export default app;
