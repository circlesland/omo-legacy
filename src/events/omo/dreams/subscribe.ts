import {Event} from "../../../core/Data/Entities/Event"

export class Subscribe extends Event
{
  readonly _$schemaId = "events:omo.dreams.subscribe";

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
