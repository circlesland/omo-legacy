import { QuantumKernel } from './kernel/QuantumKernel';

declare global {
  interface Window {
    omo: QuantumKernel;
  }
  interface SymbolConstructor {
    readonly observable: symbol;
  }
  var omo: QuantumKernel;
}

if (!window.omo) {
  window.omo = new QuantumKernel();
}
