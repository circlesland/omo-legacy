import App from './App.svelte';

var app;
async function start() {
    app = new App({
        target: document.body
    });
}

start();

export default app;
