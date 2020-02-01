// // tslint:disable: object-literal-sort-keys
// omo.quant(
//   class Person extends omo.quantum.get("omo", "quantum", "quant") {
//     public name: string | undefined;
//     public lastName: string | undefined;
//     public age: number | undefined;
//     public displayName: string | undefined;
//     static get styles(): any {
//       return [omo.normalize, omo.css``];
//     }
//     constructor() {
//       super();
//       // this.name = "";
//       // this.lastName = "";
//       // this.age = 0;
//       // this.displayName = "${this.name} ${this.lastName}";
//     }

//     public render(): void {
//       return omo.html`
//       <p>Name: ${this.name}</p>
//       <p>Nachname: ${this.lastName}</p>
//       <p>Alter: ${this.age}</p>
//       `;
//     }
//     static get properties(): any {
//       return super.properties;
//     }

//     static get model(): any {
//       return {
//         name: {
//           type: 'string'
//         },
//         lastName: {
//           type: 'string'
//         },
//         age: {
//           type: 'number'
//         },
//         email: {
//           type: 'email'
//         },
//         displayName: {
//           type: 'formular'
//         }
//       };
//     }
//   }
// );
