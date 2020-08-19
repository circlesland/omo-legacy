import {Event} from "../../../core/Data/Entities/Event"

export class CommitTime extends Event
{
  readonly _$schemaId = "events:omo.dreams.commitTime";

  data: {
    dreamId: string,
    hoursPerWeek: number
  } = {
    dreamId: "",
    hoursPerWeek: 0
  };

  constructor(dreamId: string, hoursPerWeek: number)
  {
    super();
    this.data.dreamId = dreamId;
    this.data.hoursPerWeek = hoursPerWeek;
  }
}
