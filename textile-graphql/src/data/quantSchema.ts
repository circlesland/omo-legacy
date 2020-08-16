import {JSONSchema} from "@textile/threads-database";

export const QuantSchema: JSONSchema = {
  $id: "https://example.com/quant.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  _$schemaId: "schema:omo.quant",
  title: "quant",
  type: "object",
  required: ["_id"],
  properties: {
    _id: {
      type: "string",
      description: "The instance's id.",
    },
    name: {
      type: "string",
      description: "name for displaying in views"
    },
    icon: {
      type: "string",
      description: "icon for displaying in views"
    },
    jsonSchema: {
      type: "string",
      description: "json-schema as string registering in textile"
    },
    collectionName: {
      type: "string",
      description: "name for register schema in threadDB"
    }
  }
};
