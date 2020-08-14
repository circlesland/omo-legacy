import type { Layout } from "./layout";

export interface Action {
  title: string;
  handler: string;
}

export interface Composition {
  data?: any;
  component: string /*Name der Komponente (aus ComponentRegistrar) */;
  children?: Composition[];
  area: string;
  layout?: Layout /* Alle haben layouts, leafs haben full layout */;
  actions?: Action[];
}
