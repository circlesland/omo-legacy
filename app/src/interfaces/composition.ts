import type { Layout } from "./layout";
import {Property} from "./manifest";

export interface Action {
  title: string;
  handler: string;
}

export interface Component
{
  name:string,
  properties:Property[]
}

export interface Composition {
  data?: any;
  component: Component;
  children?: Composition[];
  area: string;
  layout?: Layout /* Alle haben layouts, leafs haben full layout */;
  actions?: Action[];
}
