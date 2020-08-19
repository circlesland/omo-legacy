import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../../../core/Data/ModelQuant";

export const Dream: JSONSchema = {
  $id: "https://example.com/message.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  _$schemaId: "schema:omo.dreams.dream",
  title: "dream",
  type: "object",
  required: ["_id"],
  definitions: ModelQuant.definitons,
  properties: {
    _id: {
      type: "string"
    },
    leap: {
      type: "string"
    },
    name: {
      type: "string"
    },
    description: {
      type: "string"
    },
    creator: {
      $ref: "#/definitions/oneToOne",
      description: "Omosapien"
    },
    creatorId: {
      type: "string"
    },
    safeAddress: {
      type: "string"
    },
    city: {
      type: "string"
    },
    /**
     * If the dream is in 'dream' state, only 'reservation' subscriptions can be added
     */
    subscriptions: {
      $ref: "#/definitions/oneToMany",
      description: "Stream"
    },
    /**
     * The following properties are only valid when the dream's state is 'product'
     */
    price: {
      type: "string"
    },
    videoHash: {
      type: "string"
    },
    bannerHash: {
      type: "string"
    }
  }
};
