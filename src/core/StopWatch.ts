export class StopWatch
{
  private static starts: Map<string, number> = new Map();

  static start(name?: string)
  {
    name = name ? name : "default";
    StopWatch.starts.set(name, performance.now());
  }

  static stop(name?: string)
  {
    name = name ? name : "default";
    let start = this.starts.get(name);
    if (start == undefined)
    {
      console.warn("StopWatch has not started for " + name);
      return;
    }
    let time = performance.now() - start;
    console.debug(`${name} takes ${time}ms`)

  }
}
