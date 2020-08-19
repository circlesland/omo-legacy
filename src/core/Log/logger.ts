import {Log} from "../../events/omo/shell/log";

export class Logger
{
  public static readonly MAX_SEVERITY_LENGTH = 10;
  public static readonly MAX_SRC_LENGTH = 16;

  public static error(src: string, msg: string, data?: any)
  {
    Logger.log(src, msg, data, "ERROR");
  }

  public static warning(src: string, msg: string, data?: any)
  {
    Logger.log(src, msg, data, "WARNING");
  }

  public static log(src: string, msg: string, data?: any, severity = "DEBUG")
  {
    const severityPadding = Logger.MAX_SEVERITY_LENGTH - severity.length;
    if (severityPadding > 0)
    {
      severity = severity + " ".repeat(severityPadding);
    }
    const sourcePadding = Logger.MAX_SRC_LENGTH - src.length;
    if (sourcePadding > 0)
    {
      src = src + " ".repeat(sourcePadding);
    }
    if (data)
    {
      const getCircularReplacer = () =>
      {
        const seen = new WeakSet();
        return (key: string, value: any) =>
        {
          if (key.startsWith("_") && !key.startsWith("_$"))
          {
            return;
          }
          if (typeof value === "object" && value !== null)
          {
            if (seen.has(value))
            {
              return;
            }
            seen.add(value);
          }
          return value;
        };
      };

      const dataJson = JSON.stringify(data, getCircularReplacer());

      window.o.publishShellEventAsync(new Log(src, severity, msg, dataJson));
    }
    else
    {
      window.o.publishShellEventAsync(new Log(src, severity, msg));
    }
  }
}
