import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Logger} from "../../../core/Log/logger";

export const generateSafe: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.circles.generateSafe",
  inputs: [{
    name: "safeOwner",
    type: "schema:omo.safe.safeOwner"
  }],
  outputs: [{
    name: "safe",
    type: "schema:omo.safe.safe"
  }],
  execute: async (context, argument) =>
  {
    const ppk = context.local.inputs["safeOwner"]
    // Generate a nonce to predict Safe address
    const nonce = new Date().getTime();
    // Prepare Safe deployment and receive a predicted safeAddress
    const safeAddress = await window.o.circlesCore.safe.prepareDeploy(ppk, {nonce});
    const safe = {safeAddress: safeAddress};


    context.local.outputs["safe"] = safe;
  },
  canExecute: async context => true
};
