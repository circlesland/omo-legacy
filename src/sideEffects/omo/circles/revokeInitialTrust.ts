import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {giveTrust} from "../safe/giveTrust";
import {Logger} from "../../../core/Log/logger";

export const revokeInitialTrust: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.circles.revokeInitialTrust",
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

    async function tryRemoveTrustLineAsync(
      trustGivingSafeOwner,
      trustGivingSafeAddress,
      trustReceivingSafe
    ): Promise<boolean>
    {
      return new Promise(async (r) =>
      {
        setTimeout(async () =>
        {
          try
          {
            let canSendToC = window.o.web3.utils.toChecksumAddress(trustGivingSafeAddress.safeAddress);
            let userC = window.o.web3.utils.toChecksumAddress(trustReceivingSafe.safeAddress);
            await window.o.circlesCore.trust.removeConnection(trustGivingSafeOwner, {
              user: userC,
              canSendTo: canSendToC,
            });
            r(true);
          }
          catch (e)
          {
            Logger.warning(context.local.processNodeId + ":sideEffects:omo.safe.revokeInitialTrust", "Couldn't revoke the initial trust for safe '" + trustReceivingSafe.safeAddress + "'. Reason:", e);
            r(false);
          }
        }, 10000);
      });
    }

    async function removeTrustLineAsync(
      trustGivingSafeOwner,
      trustGivingSafeAddress,
      trustReceivingSafe
    )
    {
      let success = false;
      let triesLeft = 10;

      while (!success && triesLeft-- >= 0)
      {
        success = await tryRemoveTrustLineAsync(
          trustGivingSafeOwner,
          trustGivingSafeAddress,
          trustReceivingSafe);
        if (!success)
        {
          Logger.warning(context.local.processNodeId + ":sideEffects:omo.safe.revokeInitialTrust", "Couldn't revoke the initial trust for safe '" + trustReceivingSafe.safeAddress + "'. Tries left: " + triesLeft);
          continue;
        }
        Logger.log(context.local.processNodeId + ":sideEffects:omo.safe.revokeInitialTrust", "Revoked the initial trust for safe '" + trustReceivingSafe.safeAddress + "'");
      }
    }

    Logger.log(context.local.processNodeId + ":sideEffects:omo.circles.revokeInitialTrust", "Removing initial trust line from '" + omo1.safeOwner.address + "' to '" + context.local.inputs["trustReceiverSafe"].safeAddress + "'");
    await removeTrustLineAsync(
      omo1.safeOwner,
      omo1.safe,
      context.local.inputs["trustReceiverSafe"]
    );

    Logger.log(context.local.processNodeId + ":sideEffects:omo.circles.revokeInitialTrust", "Removing initial trust line from '" + omo2.safeOwner.address + "' to '" + context.local.inputs["trustReceiverSafe"].safeAddress + "'");
    await removeTrustLineAsync(
      omo2.safeOwner,
      omo2.safe,
      context.local.inputs["trustReceiverSafe"]
    );

    Logger.log(context.local.processNodeId + ":sideEffects:omo.circles.revokeInitialTrust", "Removing initial trust line from '" + omo3.safeOwner.address + "' to '" + context.local.inputs["trustReceiverSafe"].safeAddress + "'");
    await removeTrustLineAsync(
      omo3.safeOwner,
      omo3.safe,
      context.local.inputs["trustReceiverSafe"]
    );

    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
