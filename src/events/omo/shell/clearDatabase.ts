import {Event} from "../../../core/Data/Entities/Event"

export class ClearDatabase extends Event
{
  readonly _$schemaId = "events:omo.shell.clearDatabase";

  data: {} = {};

  constructor()
  {
    super();
  }
}
