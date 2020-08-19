import {Event} from "../../../core/Data/Entities/Event"

export class StartFlow extends Event
{
  readonly _$schemaId = "events:omo.shell.startFlow";

  data: {
    flow: string,
    argument?: any
  } = {
    flow: ""
  };

  constructor(flow: string, argument?: any)
  {
    super();
    this.data.flow = flow;
    this.data.argument = argument;
  }
}
