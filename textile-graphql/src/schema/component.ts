import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

/**
 * Describes a meta object that can be used in Blocks as placeholder for a concrete component implementation.
 */
export const Component: JSONSchema = {
    $id: "https://omo.earth/ipfs/component.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Component",
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
        properties: {
            $ref: "#/definitions/oneToMany",
            description: "Property"
        },
        actions: {
            $ref: "#/definitions/oneToMany",
            description: "Action"
        }
    },
};
