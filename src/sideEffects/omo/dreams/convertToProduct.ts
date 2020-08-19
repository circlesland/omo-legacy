/*
import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export const convertToProduct: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.dreams.convertToProduct",
  inputs: [{
    name: "videoHash",
    type: "schema:omo.string"
  },{
    name: "bannerHash",
    type: "schema:omo.any"
  },{
    name: "price",
    type: "schema:omo.any"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    const videoHash = context.local.inputs["videoHash"];
    const bannerHash = context.local.inputs["bannerHash"];
    const price = context.local.inputs["price"];

    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
 */