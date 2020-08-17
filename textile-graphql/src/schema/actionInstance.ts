import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

export const ActionInstance: JSONSchema = {
    $id: "https://omo.earth/ipfs/actionInstance.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "ActionInstance",
    type: "object",
    required: ["_id"],
    definitions: ModelQuant.definitons,
    properties: {
        _id: {
            type: "string",
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
