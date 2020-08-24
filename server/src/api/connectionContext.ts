import {ExecutionParams} from "subscriptions-transport-ws";
import {Request} from "express";

export class ConnectionContext
{
    readonly timezoneOffset?:number;
    readonly jwt?:string;

    private constructor(timezoneOffset?:number, jwt?:string)
    {
        this.timezoneOffset = timezoneOffset;
        this.jwt = jwt;
    }

    public static create(arg:{req?:Request, connection?:ExecutionParams}) : ConnectionContext
    {
        let timezoneOffset:number|undefined;
        let jwt:string|undefined;

        if (arg.req && !arg.connection)
        {
            const timezoneOffsetString = arg.req.headers["timezoneOffset"]?.toString();
            timezoneOffset = timezoneOffsetString ? parseInt(timezoneOffsetString) : undefined;
            jwt = arg.req.headers.authorization;
        }

        if (!arg.req && arg.connection)
        {
            const timezoneOffsetString = arg.connection.context.timezoneOffset?.toString();
            timezoneOffset = timezoneOffsetString ? parseInt(timezoneOffsetString) : undefined;
            jwt = arg.connection.context.authorization;
        }

        return new ConnectionContext(timezoneOffset, jwt);
    }
}