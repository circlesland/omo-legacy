import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

/**
 * Blocks are the basic runtime building blocks that are used by the ViewCompositor.
 * They pull together a component and its state-history (the state history is made up from all "propertyValues" and "actionInstances").
 */
export const Block: JSONSchema = {
    $id: "https://omo.earth/ipfs/block.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "block",
    type: "object",
    required: ["_id"],
    definitions: ModelQuant.definitons,
    properties: {
        _id: {
            type: "string",
        },
        _createdAt: {
            type: "string",
        },
        name: {
            type: "string",
        },
        layout: {
            $ref: "#/definitions/manyToOne",
            description: "Layout"
        },
        component: {
            $ref: "#/definitions/manyToOne",
            description: "Component"
        },
        area: {
            type: "string"
        },
        children: {
            $ref: "#/definitions/oneToMany",
            description: "Block"
        },
        propertyValues: {
            $ref: "#/definitions/oneToMany",
            description: "PropertyValue"
        },
        actionInstances: {
            $ref: "#/definitions/oneToMany",
            description: "ActionInstance"
        },
    },
};
