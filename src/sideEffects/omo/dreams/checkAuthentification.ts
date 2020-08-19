import { ISideEffect } from "../../../core/Flows/ISideEffect";
import { IProcessContext } from "../../../core/Flows/IProcessContext";
import { Dreams as DreamsMutations } from "../../../mutations/omo/dreams/dreams";
import { Logger } from "../../../core/Log/logger";
import { Dreams } from "../../../queries/omo/dreams/dreams";
import { Omosapiens } from "../../../queries/omo/odentity/omosapiens";

export const checkAuthentification: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.checkAuthentification",
  inputs: [
    {
      name: "dreamId",
      type: "schema:omo.string",
    },
  ],
  outputs: [
    {
      name: "void",
      type: "schema:omo.void",
    },
  ],
  execute: async (context, argument) => {
    const dreamId = context.local.inputs["dreamId"];
    const dream = await Dreams.byId(dreamId);
    if (!dream.data) throw new Error("Dream not found");
    const dreamSafeAddress = dream.data.DreamById.safeAddress;
    const ownerId = (await Omosapiens.byId(dream.data.DreamById.creatorId))
      .odentityId;
    let triesLeft = 6;

    async function checkTrust(safeOwner, safe): Promise<boolean> {
      console.log("TRUSTGIVINGSAFE", safe);
      return new Promise(async (r) => {
        setTimeout(async () => {
          let trustReturn = await window.o.circlesCore.trust.isTrusted(
            safeOwner,
            safe
          );
          if (!trustReturn.isTrusted) {
            Logger.log(
              context.local.processNodeId +
                ":sideEffects:omo.circles.deploySafe",
              "The safe isn't yet trusted enough to be deployed. " +
                "Current connections: " +
                trustReturn.trustConnections +
                ", required: 3"
            );
          }
          r(trustReturn.isTrusted);
        }, 10000);
      });
    }

    async function addTrustLineAsync(
      trustGivingSafeOwner,
      trustGivingSafe,
      trustReceivingSafe,
      trustPercentage
    ) {
      let canSendToC = window.o.web3.utils.toChecksumAddress(
        trustGivingSafe.safeAddress
      );
      let userC = window.o.web3.utils.toChecksumAddress(
        trustReceivingSafe.safeAddress
      );

      // .. give user the permission to send their Token to you
      const trusted = await window.o.circlesCore.trust.addConnection(
        trustGivingSafeOwner,
        {
          canSendTo: canSendToC,
          user: userC,
          limitPercentage: parseInt(trustPercentage),
        }
      );

      return trusted;
    }

    if (!window.o.odentity.current || !window.o.odentity.current.circleSafe)
      throw new Error("Not logged in");

    let trustReceivingSafeOwner = window.o.odentity.current.circleSafeOwner;
    let trustReceivingSafeAddress = window.o.odentity.current.circleSafe;
    let owner = await window.o.odentity.getSafe(ownerId);
    let trustGivingSafeOwner = owner.circleSafeOwner;
    let trustGivingSafe = dreamSafeAddress;
    let trustReceivingAddress = {
      safeAddress: window.o.web3.utils.toChecksumAddress(
        window.o.odentity.current.circleSafe.safeAddress
      ),
    };
    await addTrustLineAsync(
      trustGivingSafeOwner,
      { safeAddress: trustGivingSafe },
      trustReceivingSafeAddress,
      "100"
    );

    let isTrusted = false;
    while (!isTrusted && triesLeft-- >= 0) {
      isTrusted = await checkTrust(
        trustReceivingSafeOwner,
        trustReceivingAddress
      );
    }
    if (!isTrusted) {
      throw new Error("The safe wasn't trusted within 60 seconds.");
    }

    context.local.outputs["void"] = {};
  },
  canExecute: async (context) => true,
};
