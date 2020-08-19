import App from "./App.svelte";
import {Quantum} from "./core/Quantum";
import {Threads} from "./core/Textile/Threads";
import {RemoteThread} from "./core/Textile/RemoteThread";
import {async} from "rxjs";
import {init} from "./ComponentRegistrar";

declare global
{
  interface Window
  {
    o: Quantum;
  }
}

var app;

async function start()
{
  window.o = await Quantum.leap();
  init();
  app = new App({
    target: document.body,
  });
}

start();

export default app;
