import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Logger} from "../../../core/Log/logger";
import Web3 from "web3";

const BN = require("bn.js");

export const transferCircles: ISideEffect<IProcessContext, void> = {
  _$schemaId: "sideEffects:omo.safe.transferCircles",
  inputs: [{
    name: "sendingSafeOwner",
    type: "schema:omo.safe.safeOwner"
  }, {
    name: "sendingSafeAddress",
    type: "schema:omo.safe.safe"
  }, {
    name: "receivingSafeAddress",
    type: "schema:omo.safe.safe"
  }, {
    name: "amount",
    type: "schema:omo.number"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    async function sendCirclesAsync(
      sendingSafeOwner,
      sendingSafeAddress,
      receivingSafeAddress,
      amount
    )
    {
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

    await sendCirclesAsync(
      context.local.inputs["sendingSafeOwner"],
      context.local.inputs["sendingSafeAddress"],
      {
        safeAddress: context.local.inputs["receivingSafeAddress"],
      },
      context.local.inputs["amount"]
    );
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
