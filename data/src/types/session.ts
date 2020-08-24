import {SchemaTypes} from "@omo/types/dist/schemas/_generated/schemaTypes";
import {Session_1_0_0} from "@omo/types/dist/schemas/omo/types/_lib/primitives/_generated/session_1_0_0";

export class Session implements Session_1_0_0
{
  [k: string]: unknown;

  _$schemaId: SchemaTypes.Session_1_0_0 = SchemaTypes.Session_1_0_0;

  readonly id: number;
  readonly userId: number;
  readonly jwt: string;
  readonly createdAt: string;

  constructor(id: number, owner: number, jwt: string, createdAt?: string)
  {
    this.jwt = jwt;
    this.userId = owner;
    this.id = id;
    this.createdAt = createdAt ?? new Date().toJSON();
  }

}