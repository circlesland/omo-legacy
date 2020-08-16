import {JSONSchema} from "@textile/threads-database";
import {ModelQuant} from "../data/modelQuant";

export const Component: JSONSchema = {
  $id: "https://example.com/component.schema.json",
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
    }
  },
};

export const Layout: JSONSchema = {
  $id: "https://example.com/layout.schema.json",
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


export const Block: JSONSchema = {
  $id: "https://example.com/block.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "block",
  type: "object",
  required: ["_id"],
  definitions: ModelQuant.definitons,
  properties: {
    _id: {
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
    actions: {
      $ref: "#/definitions/oneToMany",
      description: "Action"
    },
    children: {
      $ref: "#/definitions/oneToMany",
      description: "Block"
    }
  },
};

export const Action: JSONSchema = {
  $id: "https://example.com/action.schema.json",
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
    }
  },
};
