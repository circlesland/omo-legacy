import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Logger} from "../../../core/Log/logger";

export const giveTrust: ISideEffect<IProcessContext, void> = {
  _$schemaId: "sideEffects:omo.safe.giveTrust",
  inputs: [{
    name: "currentSafeOwner",
    type: "schema:omo.safe.safeOwner"
  }, {
    name: "currentSafe",
    type: "schema:omo.safe.safe"
  }, {
    name: "trustReceivingSafe",
    type: "schema:omo.safe.safe"
  }, {
    name: "trustPercentage",
    type: "schema:omo.number"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    async function addTrustLineAsync(
      trustGivingSafeOwner,
      trustGivingSafe,
      trustReceivingSafe,
      trustPercentage
    )
    {
      let canSendToC = window.o.web3.utils.toChecksumAddress(trustGivingSafe.safeAddress);
      let userC = window.o.web3.utils.toChecksumAddress(trustReceivingSafe.safeAddress);

      // .. give user the permission to send their Token to you
      const trusted = await window.o.circlesCore.trust.addConnection(trustGivingSafeOwner, {
        canSendTo: canSendToC,
        user: userC,
        limitPercentage: parseInt(trustPercentage)
      });

      return trusted;
    }

    Logger.log(context.local.processNodeId + ":sideEffects:omo.safe.giveTrust", "'" + context.local.inputs["trustGivingSafe"].safeAddress + "' is giving trust to '" + context.local.inputs["trustReceivingSafe"].safeAddress + "'.");


    let trustReceivingSafeAddress = context.local.inputs["trustReceivingSafe"];
    if (trustReceivingSafeAddress.safeAddress) {
      trustReceivingSafeAddress = trustReceivingSafeAddress.safeAddress;
    }

    await addTrustLineAsync(
      context.local.inputs["trustGivingSafeOwner"],
      context.local.inputs["trustGivingSafe"],
      {
        safeAddress: trustReceivingSafeAddress
      },
      context.local.inputs["trustPercentage"]
    );

    context.local.outputs["void"] = {};

  },
  canExecute: async context => true
};
