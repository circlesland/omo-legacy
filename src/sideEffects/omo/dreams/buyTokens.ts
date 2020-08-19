import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Dreams as DreamsMutations} from "../../../mutations/omo/dreams/dreams";
import {Omosapiens} from "../../../queries/omo/odentity/omosapiens";

export const buyTokens: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.buyTokens",
  inputs: [{
    name: "dreamId",
    type: "schema:omo.string"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    const dreamId = context.local.inputs["dreamId"];
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
