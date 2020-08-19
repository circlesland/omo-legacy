import type { Layout } from "./layout";
import {Property} from "./manifest";

export interface ActionHandler
{
  handlerName:string; // Corresponds to the "handlerName" in the Action-interface
  handler: (component:Component) => Promise<void>;
}

export interface Action {
  title: string;
  handlerName: string;
}

export interface View
{
  name:string,
  properties:Property[]
}

export interface Component {
  data?: any;
  component: View;
  children?: Component[];
  area: string;
  layout?: Layout
  // actions?: Action[];
}
