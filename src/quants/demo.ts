// // tslint:disable: object-literal-sort-keys
// omo.quant(
//   class Demo extends omo.quantum.get("omo", "quantum", "quant") {
//     public required: string;
//     public disabled: string;
//     public static get styles(): any[] {
//       return [omo.normalize, omo.css``];
//     }
//     constructor() {
//       super();
//       this.required = '';
//       this.disabled = "I'm disabled";
//     }

//     public render(): any {
//       return omo.html`
//       <p>TODO</p>
//       `;
//     }

//     static get model(): any {
//       return {
//         string: {
//           type: 'string'
//         },
//         stringpattern: {
//           onError: 'Bitte eine gültige email eingeben',
//           pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$',
//           type: 'string'
//         },
//         disabled: {
//           disabled: true,
//           type: 'string'
//         },
//         formular: {
//           type: 'formular'
//         },
//         relation: {
//           display: 'string',
//           quant: this,
//           type: 'relation'
//         },
//         required: {
//           required: true,
//           type: 'string'
//         },

//         boolean: {
//           type: 'boolean'
//         },
//         number: {
//           type: 'number'
//         },
//         email: {
//           type: 'email',
//           pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$',
//           onError: 'Bitte eine gültige email eingeben'
//         },
//         password: {
//           type: 'password'
//         },
//         hardPassword: {
//           type: 'password',
//           pattern: '.{6,}',
//           onError: 'Mindestens 6 Zeichen'
//         },
//         file: {
//           type: 'file'
//         },
//         color: {
//           type: 'color'
//         },
//         date: {
//           type: 'date'
//         },
//         datetimelocal: {
//           type: 'datetime-local'
//         },
//         month: {
//           type: 'month'
//         },
//         week: {
//           type: 'week'
//         },
//         url: {
//           type: 'url'
//         },
//         search: {
//           type: 'search'
//         },
//         tel: {
//           type: 'tel'
//         }
//       };
//     }

//     public static get properties(): any {
//       return super.properties;
//     }
//   }
// );
