import App from './App.svelte';
import { OmoRuntime } from "./omoRuntime";
import {OmoSeeder} from "./omoSeeder";

declare global {
    interface Window {
        o: OmoRuntime;
    }
}

var app;
async function start() {
    window.o = await OmoRuntime.init();

    const seeder = new OmoSeeder(window.o.textile);
    await seeder.seedUI();

    app = new App({
        target: document.body
    });
}

start();

export default app;
