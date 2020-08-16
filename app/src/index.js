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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEdBQUcsTUFBTSxjQUFjLENBQUM7QUFDL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQVExQyxJQUFJLEdBQUcsQ0FBQztBQUNSLEtBQUssVUFBVSxLQUFLO0lBQ2hCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztJQUM1QixHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7UUFDVixNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUk7S0FDeEIsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELEtBQUssRUFBRSxDQUFDO0FBRVIsZUFBZSxHQUFHLENBQUMifQ==