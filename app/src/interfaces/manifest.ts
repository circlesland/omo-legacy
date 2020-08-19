export interface Property
{
  _id:string,
  /**
   * The name of the property like: "title", "description", "image" etc.
   */
  name:string,
  description:string,
  /**
   * The type of the property. Can be either a built-in typescript primitive or the id of a json-schema.
   * Examples: "number", "string", "https://omo.earth/ipfs/layout.schema.json" or "https://omo.earth/ipfs/action.schema.json"
   */
  schema:string,
  /**
   * If the property can be omitted or not.
   */
  isOptional:boolean
}

export interface Manifest {
  name: string,
  /**
   * Specifies the inputs, a component needs to function properly.
   */
  properties: Property[]
}
