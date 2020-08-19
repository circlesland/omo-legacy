import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

export const ParameterizedAction: JSONSchema = {
  $id: "https://omo.earth/ipfs/parameterizedAction.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ParameterizedAction",
  type: "object",
  required: ["_id"],
  definitions: ModelQuant.definitons,
  properties: {
    _id: {
      type: "string",
    },
    _createdAt: {
      tyoe: "string"
    },
    action: {
      $ref: "#/definitions/manyToOne",
      description: "Action"
    },
    propertyValues: {
      $ref: "#/definitions/oneToMany",
      description: "PropertyValue"
    }
  },
};
