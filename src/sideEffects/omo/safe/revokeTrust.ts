import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Logger} from "../../../core/Log/logger";

export const revokeTrust: ISideEffect<IProcessContext, void> = {
  _$schemaId: "sideEffects:omo.safe.revokeTrust",
  inputs: [{
    name: "trustGivingSafeOwner",
    type: "schema:omo.safe.safeOwner"
  }, {
    name: "trustGivingSafe",
    type: "schema:omo.safe.safe"
  }, {
    name: "trustReceivingSafe",
    type: "schema:omo.safe.safe"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    async function removeTrustLineAsync(
      trustGivingSafeOwner,
      trustGivingSafe,
      trustReceivingSafe
    )
    {
      let canSendToC = window.o.web3.utils.toChecksumAddress(trustGivingSafe.safeAddress);
      let userC = window.o.web3.utils.toChecksumAddress(trustReceivingSafe.safeAddress);

      // .. give user the permission to send their Token to you
      await window.o.circlesCore.trust.removeConnection(trustGivingSafeOwner, {
        user: userC,
        canSendTo: canSendToC,
      });
      alert("Untrusted: " + userC);
    }

    Logger.log(context.local.processNodeId + ":sideEffects:omo.safe.revokeTrust", "'" + context.local.inputs["trustGivingSafe"].safeAddress + "' is revoking trust from '" + context.local.inputs["trustReceivingSafe"].safeAddress + "'.");
    await removeTrustLineAsync(
      context.local.inputs["trustGivingSafeOwner"],
      context.local.inputs["trustGivingSafe"],
      {
        safeAddress: context.local.inputs["trustReceivingSafe"]
      }
    );
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
