import {Event} from "../../../core/Data/Entities/Event"

export class Navigate extends Event
{
  readonly _$schemaId = "events:omo.shell.navigate";

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
