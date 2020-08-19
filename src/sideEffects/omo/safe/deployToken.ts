import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Logger} from "../../../core/Log/logger";

export const deployToken: ISideEffect<IProcessContext, void> = {
  _$schemaId: "sideEffects:omo.safe.deployToken",
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
    async function tryDeployToken(
      safeOwner,
      safe
    ): Promise<boolean>
    {
      return new Promise(async (r) =>
      {
        setTimeout(async () =>
        {
          try
          {
            await window.o.circlesCore.token.deploy(safeOwner, safe);
            r(true);
          }
          catch (e)
          {
            Logger.warning(context.local.processNodeId + ":sideEffects:omo.safe.deployToken", "Couldn't deploy token for safe '" + safe.safeAddress + "'. Reason:", e);
            r(false);
          }
        }, 10000);
      });
    }

    async function deployToken(
      safeOwner,
      safe
    )
    {
      let success = false;
      let triesLeft = 10;

      while (!success && triesLeft-- >= 0)
      {
        success = await tryDeployToken(safeOwner, safe);
        if (!success)
        {
          Logger.warning(context.local.processNodeId + ":sideEffects:omo.safe.deployToken", "Couldn't deploy token for safe '" + safe.safeAddress + "'. Tries left: " + triesLeft);
          continue;
        }
        Logger.log(context.local.processNodeId + ":sideEffects:omo.safe.deployToken", "Deployed token for safe '" + safe.safeAddress + "'");
      }
    }

    await deployToken(
      context.local.inputs["safeOwner"],
      context.local.inputs["safe"]
    );

    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
