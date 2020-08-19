import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Logger} from "../../../core/Log/logger";

export const generatePpk: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.web3.generatePpk",
  inputs: [],
  outputs: [{
    name: "safeOwner",
    type: "schema:omo.safe.safeOwner"
  }],
  execute: async (context, argument) =>
  {
    const ppk = window.o.web3.eth.accounts.create();
    Logger.log(context.local.processNodeId + ":sideEffects:omo.web3.generatePpk", "Generated new PPK. Address:", ppk.address);
    context.local.outputs["safeOwner"] = ppk;
  },
  canExecute: async context => true
};
