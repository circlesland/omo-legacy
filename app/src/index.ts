import App from './App.svelte';
import {Registrar} from "./ComponentRegistrar";
import {Adapter} from "@omo/textile-graphql/dist/adapter";

declare global {
    interface Window {
        registrar: Registrar;
        //o: Quantum;
    }
}

var adapter = Adapter.create();
var app;
async function start()
{
    window.registrar = new Registrar();
//  window.o = await Quantum.leap();
    app = new App({
        target: document.body
    });
}

start();

export default app;
