import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../../../core/Data/ModelQuant";

export const Location: JSONSchema = {
  $id: "https://example.com/message.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  _$schemaId: "schema:omo.location",
  title: "location",
  type: "object",
  required: ["_id"],
  definitions: ModelQuant.definitons,
  properties: {
    _id: {
      type: "string",
    },
    city: {
      type: "string",
    },
    country: {
      type: "string",
    },
    dreams: {
      $ref: "#/definitions/oneToMany",
      description: "Dream"
    }
  }
};
