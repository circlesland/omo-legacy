import { QuantumKernel } from './kernel/QuantumKernel';
import { Ace } from './types/ace';

declare global {
  interface Window {
    omo: QuantumKernel;
  }
  interface SymbolConstructor {
    readonly observable: symbol;
  }
  var omo: QuantumKernel;
  var ace: Ace.Ace;
}

if (!window.omo) {
  window.omo = new QuantumKernel();
}
