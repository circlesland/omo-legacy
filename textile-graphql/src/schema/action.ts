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
        direction: {
            type: "string",
            enum: [
                "send", // The component that uses this action, "sends" ActionInstances of this type
                "receive", // The component that uses this action, "receives" ActionInstances of this type
                "duplex" // The component that uses this action, "sends" and "receives" ActionInstances of this type
            ]
        },
        properties: {
            $ref: "#/definitions/oneToMany",
            description: "Property"
        }
    },
};
