import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Dreams as DreamsMutations} from "../../../mutations/omo/dreams/dreams";

export const createDream: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.createDream",
  inputs: [{
    name: "name",
    type: "schema:omo.string"
  },{
    name: "safe",
    type: "schema:omo.any"
  }],
  outputs: [{
    name: "dreamId",
    type: "schema:omo.string"
  }],
  execute: async (context, argument) =>
  {
    const dreamName = context.local.inputs["name"];
    const safeAddress = context.local.inputs["safe"].safeAddress;
    const description = context.local.inputs["dreamDescription"];
    const city = context.local.inputs["cityName"];

    const newDream = await DreamsMutations.createNewDream(dreamName, description, city, safeAddress);
    console.log("Created new dream:", newDream);

    context.local.outputs["dreamId"] = newDream._id;
  },
  canExecute: async context => true
};
