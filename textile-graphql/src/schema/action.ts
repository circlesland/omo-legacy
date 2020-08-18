import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

/**
 * Describes a meta object that can be used in Components as placeholder for a concrete action implementation.
 */
export const Action: JSONSchema = {
    $id: "https://omo.earth/ipfs/action.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Action",
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
        title: {
            type: "string",
        },
        glyph: {
            type: "string",
        },
        properties: {
            $ref: "#/definitions/oneToMany",
            description: "Property"
        }
    },
};
