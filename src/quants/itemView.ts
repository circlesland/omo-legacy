// omo.quant(
//   class ItemView extends omo.quantum.get("omo", "quantum", "quant") {
//     public quantname: string | undefined;
//     public quant: any;

//     static get styles(): any {
//       return [
//         omo.theme,
//         omo.css/*css*/ `
//         :host{
//         }
//         `
//       ];
//     }

//     static get model(): any {
//       return {
//         quant: { type: 'object' },
//         quantname: { type: 'string' }
//       };
//     }

//     constructor() {
//       super();
//     }

//     public async show(constructor: any, entity: any): Promise<void> {
//       console.log(constructor);
//       this.quantname = constructor.name;
//       const quant = new constructor();
//       quant.ID = entity;
//       await quant.initAsync();
//       console.log(quant.model);
//       this.quant = quant;
//       console.log(entity);
//     }
//     static get properties(): any {
//       return super.properties;
//     }

//     public render(): void {
//       console.log(this.quant._model);
//       return omo.html`
//       <div class="w-full p-20">
//         <h1 class="text-3xl text-center">
//           ${this.quantname}
//         </h1>
//         <form>
//           ${Object.keys(this.quant._model).map(
//             key => omo.html`
//               <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
//                 <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-zip">
//                   ${key}
//                 </label>
//                 <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-zip" type="text" value="${this.quant[key]}">
//               </div>
//           `
//           )}
//           </form>   
//         </div>
//         ${JSON.stringify(this.quant.model)}
//       `;
//     }
//   }
// );
