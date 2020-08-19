import {Event} from "../../../core/Data/Entities/Event"

export class Notification extends Event
{
  readonly _$schemaId = "events:omo.shell.notification";

  data: {
    icon: string,
    title: string,
    message: string
  } | undefined = undefined;
}
