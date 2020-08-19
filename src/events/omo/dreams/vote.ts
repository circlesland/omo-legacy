import {Event} from "../../../core/Data/Entities/Event"

export class Vote extends Event
{
  readonly _$schemaId = "events:omo.dreams.vote";

  data: {
    dreamId: string
  } = {
    dreamId: ""
  };

  constructor(dreamId: string)
  {
    super();
    this.data.dreamId = dreamId;
  }
}
