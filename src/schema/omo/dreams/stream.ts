import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../../../core/Data/ModelQuant";

export const Stream: JSONSchema = {
  $id: "https://example.com/message.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  _$schemaId: "schema:omo.dreams.Stream",
  title: "Stream",
  type: "object",
  required: ["_id"],
  definitions: ModelQuant.definitons,
  properties: {
    _id: {
      type: "string"
    },
    /**
     * Can be 'reservation' or 'subscription'
     */
    state: {
      type: "string"
    },
    creator: {
      $ref: "#/definitions/oneToOne",
      description: "Omosapien"
    }
  }
};
