import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

export const Layout: JSONSchema = {
    $id: "https://omo.earth/ipfs/layout.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "layout",
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
        areas: {
            type: "string",
        },
        columns: {
            type: "string",
        },
        rows: {
            type: "string"
        }
    },
};
