import App from './App.svelte';
import { Registrar } from "./ComponentRegistrar";

declare global {
    interface Window {
        registrar: Registrar;
        //o: Quantum;
    }
}

var app;
async function start() {
    window.registrar = new Registrar();
    //  window.o = await Quantum.leap();
    app = new App({
        target: document.body
    });
}

start();

export default app;
