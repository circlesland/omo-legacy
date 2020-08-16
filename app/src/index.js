import App from './App.svelte';
import { Registrar } from "./ComponentRegistrar";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEdBQUcsTUFBTSxjQUFjLENBQUM7QUFDL0IsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBU2pELElBQUksR0FBRyxDQUFDO0FBQ1IsS0FBSyxVQUFVLEtBQUs7SUFDaEIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO0lBQ25DLG9DQUFvQztJQUNwQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7UUFDVixNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUk7S0FDeEIsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELEtBQUssRUFBRSxDQUFDO0FBRVIsZUFBZSxHQUFHLENBQUMifQ==