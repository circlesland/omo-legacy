import {Event} from "../../../core/Data/Entities/Event"

export class RequestSubmitFlowStep extends Event
{
  readonly _$schemaId = "events:omo.shell.requestSubmitFlowStep";

  data: {
    processNodeId: string
  } = {
    processNodeId: ""
  };

  constructor(processNodeId: string)
  {
    super();
    this.data.processNodeId = processNodeId;
  }
}
