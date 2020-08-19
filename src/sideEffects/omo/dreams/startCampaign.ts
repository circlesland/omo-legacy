import { ISideEffect } from "../../../core/Flows/ISideEffect";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

import { Dreams as DreamsMutations } from "../../../mutations/omo/dreams/dreams";

export const startCampaign: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.startCampaign",
  inputs: [{
    name: "videoHash",
    type: "schema:omo.string"
  },
  //  {
  //   name: "bannerHash",
  //   type: "schema:omo.any"
  // }, 
  {
    name: "price",
    type: "schema:omo.any"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) => {
    var dreamId = "";
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("data")) {
      dreamId = urlParams.get("data") || "";
    }
    //const videoHash = context.local.inputs["videoHash"];
    const price = context.local.inputs["price"];
    await DreamsMutations.startCampaign(dreamId, "https://ipfs.io/ipfs/QmQn4Wih8PYHBzrkq55y4gnrhe2z9SYtYnsLrJHGenNTXC", price);
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};