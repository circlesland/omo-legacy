import { IProcessContext } from "../../../core/Flows/IProcessContext";
import { ISideEffect } from "../../../core/Flows/ISideEffect";
import { Omosapiens as OmosapiensMutations } from "../../../mutations/omo/odentity/omosapiens";

export const createOmosapien: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.odentity.createOmosapien",
  inputs: [{
    name: "name",
    type: "schema:omo.string"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) => {
    window.o.quantRegistry.syncAllCollections();
    const name = context.local.inputs["name"];
    const safeAddress = context.local.inputs["safe"].safeAddress;

    if (!window.o.odentity.current) {
      throw new Error("Cannot create Omosapien: No current odentity!")
    }

    const created = await OmosapiensMutations.createNewOmosapien(name, safeAddress, window.o.odentity.current._id);
    console.log("Created new Omosapien:", created);

    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
