import {Event} from "../../../core/Data/Entities/Event"

export class Logout extends Event
{
  readonly _$schemaId = "events:omo.shell.logout";

  data: {} = {};

  constructor()
  {
    super();
  }
}
