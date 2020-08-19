import { Instance } from "@textile/threads-store";

export interface IEvent {
  _$schemaId: string;
}

export abstract class Event implements Instance, IEvent {
  static CollectionName: string = "Events";
  abstract _$schemaId: string;

  _id: string;
  readonly timestamp?: string = new Date().toJSON();

  constructor() {
    this._id = '';
  }
}
