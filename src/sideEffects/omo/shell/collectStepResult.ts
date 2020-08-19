import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export const collectStepResult: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.shell.collectStepResult",
  inputs: [],
  outputs: [{
    name: "stepResult",
    type: "schema:omo.any"
  }],
  execute: async (context, argument) =>
  {
    context.local.outputs["stepResult"] = argument;
  },
  canExecute: async context => true
};
