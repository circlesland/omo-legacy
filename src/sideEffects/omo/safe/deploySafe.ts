import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Logger} from "../../../core/Log/logger";

export const deploySafe: ISideEffect<IProcessContext, void> = {
  _$schemaId: "sideEffects:omo.safe.deploySafe",
  inputs: [{
    name: "safeOwner",
    type: "schema:omo.safe.safeOwner"
  }, {
    name: "safe",
    type: "schema:omo.safe.safe"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    let triesLeft = 6;

    async function checkTrust(
      safeOwner,
      safe
    ): Promise<boolean>
    {
      return new Promise(async (r) =>
      {
        setTimeout(async () =>
        {
          let trustReturn = await window.o.circlesCore.trust.isTrusted(safeOwner, safe);
          if (!trustReturn.isTrusted)
          {
            Logger.log(context.local.processNodeId + ":sideEffects:omo.circles.deploySafe", "The safe isn't yet trusted enough to be deployed. " +
              "Current connections: " + trustReturn.trustConnections + ", required: 3");
          }
          r(trustReturn.isTrusted);
        }, 10000);
      });
    }

    async function addTrustLineAsync(
      safeOwner,
      safe
    )
    {
      //  Check if we have enough giveTrust connections
      let isTrusted = false;
      while (!isTrusted && triesLeft-- >= 0)
      {
        isTrusted = await checkTrust(safeOwner, safe);
      }
      if (!isTrusted)
      {
        throw new Error("The safe wasn't trusted within 60 seconds.");
      }

      await window.o.circlesCore.safe.deploy(safeOwner, safe);
    }

    await addTrustLineAsync(
      context.local.inputs["safeOwner"],
      context.local.inputs["safe"]
    );

    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
