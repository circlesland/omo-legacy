import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

export const Property: JSONSchema = {
    $id: "https://omo.earth/ipfs/property.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Property",
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
        schema: {
            type: "string",
        },
        isOptional: {
            type: "string"
        }
    }
};
