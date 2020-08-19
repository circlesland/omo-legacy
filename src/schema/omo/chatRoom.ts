import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../../core/Data/ModelQuant";

export const ChatRoom: JSONSchema = {
  $id: "https://example.com/ChatRoom.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  _$schemaId: "schema:omo.chatRoom",
  title: "chatRoom",
  type: "object",
  required: ["_id"],
  definitions: ModelQuant.definitons,
  properties: {
    _id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    text: {
      type: "string",
    },
    dreamId: {
      type: "string",
    },
    messages: {
      $ref: "#/definitions/oneToMany",
      description: "Message"
    }
  },
};
