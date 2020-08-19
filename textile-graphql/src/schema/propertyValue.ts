import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

export const PropertyValue: JSONSchema = {
    $id: "https://omo.earth/ipfs/propertyValue.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "PropertyValue",
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
        property: {
            $ref: "#/definitions/manyToOne",
            description: "Property"
        },
        value: {
            type: "string"
        }
    },
};
