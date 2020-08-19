import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Dreams as DreamsMutations} from "../../../mutations/omo/dreams/dreams";
import {Omosapiens} from "../../../queries/omo/odentity/omosapiens";

export const addCommitment: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.addCommitment",
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

    const odentity = window.o.odentity.current;
    if (!odentity)
      throw new Error("No current identity!");

    const omosapien = await Omosapiens.byOdentityId(odentity._id)
    const newCommitment = await DreamsMutations.newCommitment(dreamId, omosapien._id);
    console.log("Created new commitment:", newCommitment);
  },
  canExecute: async context => true
};
