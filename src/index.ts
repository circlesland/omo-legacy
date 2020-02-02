import { QuantumKernel } from './kernel/QuantumKernel';
import { Ace } from './types/ace';

if (!window.omo) {
  window.omo = new QuantumKernel();
}

declare global {
  interface Window {
    omo: QuantumKernel;
  }
  interface SymbolConstructor {
    readonly observable: symbol;
  }
  var omo: QuantumKernel;
  var ace: Ace.Ace;
  interface Function {
    model: any;
    recursiveModel: any;
    createSchemaProperties: any;
    createJsonSchema: any;
    getModelName: any;
    _model: any;
    _modelName: any;
    Init: any;
    schemaProperties: any;
  }
}
