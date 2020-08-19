import {ISideEffect} from "../../../core/Flows/ISideEffect";
import {IProcessContext} from "../../../core/Flows/IProcessContext";
import {Rooms} from "../../../mutations/omo/chat/rooms";

export const createChatRoom: ISideEffect<IProcessContext, any> = {
  _$schemaId: "sideEffects:omo.chat.createChatRoom",
  inputs: [{
    name: "name",
    type: "schema:omo.string"
  },{
    name: "dreamId",
    type: "schema:omo.string"
  }],
  outputs: [{
    name: "void",
    type: "schema:omo.void"
  }],
  execute: async (context, argument) =>
  {
    const chatRoomName = context.local.inputs["name"];
    const dreamId = context.local.inputs["dreamId"];
    const newRoom = await Rooms.createNewRoom(chatRoomName, dreamId);
    console.log("Created new room:", newRoom);
    context.local.outputs["void"] = {};
  },
  canExecute: async context => true
};
