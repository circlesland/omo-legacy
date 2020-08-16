import App from './App.svelte';
import { OmoRuntime } from "./omoRuntime";
var app;
async function start() {
    window.o = new OmoRuntime();
    app = new App({
        target: document.body
    });
}
start();
export default app;
//# sourceMappingURL=index.js.map