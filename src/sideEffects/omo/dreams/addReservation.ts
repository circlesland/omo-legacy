import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Dreams as DreamsMutations} from "../../../mutations/omo/dreams/dreams";
import {Omosapiens} from "../../../queries/omo/odentity/omosapiens";

export const addReservation: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.addReservation",
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

    if (!window.o.odentity.current)
      throw new Error("No current odentity.");

    const omosapien = await Omosapiens.byOdentityId(window.o.odentity.current._id)
    const newReservation = await DreamsMutations.newReservation(dreamId, omosapien._id);
    console.log("Created new reservation:", newReservation);
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
