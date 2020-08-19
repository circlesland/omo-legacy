import { ISideEffect } from "../../../core/Flows/ISideEffect";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export const navigate: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.shell.navigate",
  inputs: [{
    name: "page",
    type: "schema:omo.string"
  }],
  outputs: [],
  execute: async (context, argument) => {
    var redirectPage = context.local.inputs["page"];
    window['navigate'](redirectPage);
  },
  canExecute: async context => true
};
