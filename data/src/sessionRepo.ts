import {prisma} from "./prisma";
import {Session} from "./types/session";
import {Session_1_0_0} from "@omo/types/dist/schemas/omo/types/_lib/primitives/_generated/session_1_0_0";
import {SchemaTypes} from "@omo/types/dist/schemas/_generated/schemaTypes";
import {Helper} from "@omo/interfaces/dist/helper";

export class SessionRepo
{
  constructor()
  {
  }

  async findSessionByJwt(jwt: string): Promise<Session_1_0_0 | undefined>
  {
    try
    {
      const jwtData = await Helper.sessionFromJwt(jwt);
      const session = await prisma.session.findOne({
        where: {
          id: jwtData.id
        }
      });

      if (!session)
        return undefined; // TODO: Log warning

      const now = new Date();
      if (session.validTo <= now || session.loggedOutAt || session.timedOutAt || session.revokedAt)
        return undefined; // TODO: Log warning

      return <Session_1_0_0>{
        _$schemaId: SchemaTypes.Session_1_0_0,
        id: session.id,
        createdAt: session.createdAt.toJSON(),
        timezoneOffset: session.timezoneOffset,
        validTo: session.validTo.toJSON(),
        jwt: jwt
      };
    }
    catch (e)
    {
      return undefined;
    }
  }

  async createSession(userId: number): Promise<Session>
  {
    const newSession = await prisma.session.create({
      data: {
        user: {
          connect: {
            id: userId
          }
        },
        createdAt: new Date(),
        validTo: new Date(new Date().getTime() + (24 * 60 * 60 * 60 * 1000)),
        createdByRequestId: "-"
      }
    });

    const jwt = Helper.sessionToJwt(<Session_1_0_0>{
      _$schemaId: SchemaTypes.Session_1_0_0,
      id: newSession.id,
      createdAt: newSession.createdAt.toJSON(),
      timezoneOffset: newSession.timezoneOffset,
      validTo: newSession.validTo.toJSON()
    });

    return new Session(newSession.id, newSession.userId, jwt, newSession.createdAt.toJSON());
  }
}