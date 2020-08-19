import {Event} from "../../../core/Data/Entities/Event"

export class Navigated extends Event
{
  readonly _$schemaId = "events:omo.shell.navigated";

  data: {
    page: string, // ?page=
    [others: string]: any; // &..=..&..
  } = {
    page: ""
  };

  constructor(page: string)
  {
    super();
    this.data.page = page;
  }
}
