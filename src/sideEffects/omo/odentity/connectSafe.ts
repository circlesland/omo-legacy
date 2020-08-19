import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {ISideEffect} from "../../../core/Flows/ISideEffect";

export const connectSafe: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.odentity.connectSafe",
  inputs: [{
    name: "safeOwner",
    type: "schema:omo.any"
  }, {
    name: "safe",
    type: "schema:omo.any"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    const safeOwner = context.local.inputs["safeOwner"];
    const safeAddress = context.local.inputs["safe"].safeAddress;

    await window.o.odentity.connectCircleWallet(safeOwner, safeAddress);

    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
