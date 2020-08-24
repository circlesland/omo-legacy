import {Session_1_0_0} from "../../types/dist/schemas/omo/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaTypes} from "../../types/dist/schemas/_generated/schemaTypes";

const jsonwebtoken = require('jsonwebtoken');

export class Helper
{
  public static async sessionFromJwt(jwt: string) : Promise<Session_1_0_0>
  {
    jsonwebtoken.verify(jwt, "4"); // TODO: Get jwt secret from config
    const decodedPayload = jsonwebtoken.decode(jwt);

    return <Session_1_0_0> {
      _$schemaId: SchemaTypes.Session_1_0_0,
      id: decodedPayload.jti,
      validTo: new Date(decodedPayload.exp * 1000).toJSON(),
      createdAt: new Date(decodedPayload.iat * 1000).toJSON(),
      userId: decodedPayload.sub,
      timezoneOffset: decodedPayload.timezoneOffset,
      jwt: jwt,
    };
  }

  public static sessionToJwt(session:Session_1_0_0) : string
  {
    if (!session.validTo)
      throw new Error("The session mus have a validTo date in JSON format.");

    if (!session.createdAt)
      throw new Error("The session mus have a createdAt date in JSON format.");

    const tokenData = {
      jti: session.id,
      iss: "ABIS", // TODO: Get jwt issuer from config
      exp: new Date(session.validTo).getTime() / 1000,
      iat: new Date(session.createdAt).getTime() / 1000,
      sub: session.userId,
      timezoneOffset: session.timezoneOffset
    };

    const jwt: string = jsonwebtoken.sign(tokenData, "4"); // TODO: Get jwt secret from config
    return jwt;
  }
}