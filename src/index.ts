import { QuantumKernel } from "./kernel/QuantumKernel";

if (module.hot) {
  module.hot.accept();
}

declare global {
  interface Window {
    omo: QuantumKernel;
  }
}

if (!window.omo) {
  window.omo = new QuantumKernel();
}
