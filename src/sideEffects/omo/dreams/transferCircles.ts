import { ISideEffect } from "../../../core/Flows/ISideEffect";
import { IProcessContext } from "../../../core/Flows/IProcessContext";
import { Logger } from "../../../core/Log/logger";
import { Dreams } from "../../../queries/omo/dreams/dreams";
import Web3 from "web3";

const BN = require("bn.js");

export const transferCircles: ISideEffect<IProcessContext, void> = {
  _$schemaId: "sideEffects:omo.dreams.transferCircles",
  inputs: [{
    name: "dreamId",
    type: "schema:omo.string"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) => {
    async function sendCirclesAsync(
      sendingSafeOwner,
      sendingSafeAddress,
      receivingSafeAddress,
      amount
    ) {
      let receivingSafeAddressC = window.o.web3.utils.toChecksumAddress(receivingSafeAddress.safeAddress);
      let sendingSafeAddressC = window.o.web3.utils.toChecksumAddress(sendingSafeAddress.safeAddress);

      Logger.log(context.local.processNodeId + ":sideEffects:omo.safe.transferCircles", "Transferring '" + amount + "' circles from '" + sendingSafeAddressC + "' to '" + receivingSafeAddressC + "'.");

      // .. give user the permission to send their Token to you
      await window.o.circlesCore.token.transfer(sendingSafeOwner, {
        from: sendingSafeAddressC,
        to: receivingSafeAddressC,
        value: new BN(window.o.web3.utils.toWei(amount, "ether"))
      });

      Logger.log(context.local.processNodeId + ":sideEffects:omo.safe.transferCircles", "Sent '" + amount + "' circles from '" + sendingSafeAddressC + "' to '" + receivingSafeAddressC + "'.");
    }
    if (!window.o.odentity.current || !window.o.odentity.current.circleSafe)
      throw new Error("not logged in");

    const dreamId = context.local.inputs["dreamId"];
    const dream = await Dreams.byId(dreamId);
    if (!dream.data) throw new Error("Dream not found");
    const dreamSafeAddress = dream.data.DreamById.safeAddress;

    let sendingSafeOwner = window.o.odentity.current.circleSafeOwner;
    let sendingSafeAddress = window.o.odentity.current.circleSafe;
    let receivingSaveAddress = {
      safeAddress: dreamSafeAddress,
    };

    await sendCirclesAsync(
      sendingSafeOwner,
      sendingSafeAddress,
      receivingSaveAddress,
      "1"
    );
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
