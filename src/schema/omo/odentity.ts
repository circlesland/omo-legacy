import {JSONSchema} from "@textile/threads-database";

export const Odentity: JSONSchema = {
  $id: "https://example.com/omo.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  _$schemaId: "schema:omo.odentity",
  title: "odentity",
  type: "object",
  required: ["_id"],
  properties: {
    _id: {
      type: "string",
    },
    threadId: {
      type: "string",
    },
    cryptoIdentity: {
      type: "string"
    },
    circleSafe: {
      type: "object",
      properties: {
        safeAddress: {
          type:"string"
        }
      }
    },
    circleSafeOwner: {
      type:"object",
      properties: {
        address: {
          type: "string"
        },
        privateKey: {
          type: "string"
        }
      }
    }
  },
};
