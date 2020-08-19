import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {giveTrust} from "../safe/giveTrust";
import {Logger} from "../../../core/Log/logger";

export const giveInitialTrust: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.circles.giveInitialTrust",
  inputs: [{
    name: "trustReceiverSafe",
    type: "schema:omo.safe.safe",
    description: ""
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    const omo1 = {
      safeOwner: {
        privateKey: process.env.OMO1_ACCOUNT_PRIVATEKEY,
        address: process.env.OMO1_ACCOUNT_ADDRESS
      },
      safe: {safeAddress: process.env.OMO1_SAFE_SAFEADDRESS}
    };
    const omo2 = {
      safeOwner: {
        privateKey: process.env.OMO2_ACCOUNT_PRIVATEKEY,
        address: process.env.OMO2_ACCOUNT_ADDRESS
      },
      safe: {safeAddress: process.env.OMO2_SAFE_SAFEADDRESS}
    };
    const omo3 = {
      safeOwner: {
        privateKey: process.env.OMO3_ACCOUNT_PRIVATEKEY,
        address: process.env.OMO3_ACCOUNT_ADDRESS
      },
      safe: {safeAddress: process.env.OMO3_SAFE_SAFEADDRESS}
    };

    async function addTrustLineAsync(
      trustGivingSafeOwner,
      trustGivingSafe,
      trustReceivingSafe,
      trustPercentage
    )
    {
      // .. give user the permission to send their Token to you
      await window.o.circlesCore.trust.addConnection(trustGivingSafeOwner, {
        canSendTo: trustGivingSafe.safeAddress,
        user: trustReceivingSafe.safeAddress,
        limitPercentage: trustPercentage
      });
    }

    Logger.log(context.local.processNodeId + ":sideEffects:omo.circles.giveInitialTrust", "Owner '" + omo1.safeOwner.address + "' trusts '" + context.local.inputs["trustReceiverSafe"].safeAddress + "'..");
    await addTrustLineAsync(
      omo1.safeOwner,
      omo1.safe,
      context.local.inputs["trustReceiverSafe"],
      1,
    );

    Logger.log(context.local.processNodeId + ":sideEffects:omo.circles.giveInitialTrust", "Owner '" + omo2.safeOwner.address + "' trusts '" + context.local.inputs["trustReceiverSafe"].safeAddress + "'..");
    await addTrustLineAsync(
      omo2.safeOwner,
      omo2.safe,
      context.local.inputs["trustReceiverSafe"],
      1,
    );

    Logger.log(context.local.processNodeId + ":sideEffects:omo.circles.giveInitialTrust", "Owner '" + omo3.safeOwner.address + "' trusts '" + context.local.inputs["trustReceiverSafe"].safeAddress + "'..");
    await addTrustLineAsync(
      omo3.safeOwner,
      omo3.safe,
      context.local.inputs["trustReceiverSafe"],
      1,
    );

    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
