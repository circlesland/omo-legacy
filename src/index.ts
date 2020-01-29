import { QuantumKernel } from "./kernel/QuantumKernel";

declare global {
  interface Window {
    omo: QuantumKernel;
  }
  var omo: QuantumKernel;
}

if (!window.omo) {
  window.omo = new QuantumKernel();
}
