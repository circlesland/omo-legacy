import { Instance } from "@textile/threads-store";

export class OdentityProvider implements Instance {
  static CollectionName: string = "OdentityProvider";

  _id: string;
  odentityId?: string;
  type?: string;
  externalReference?: string;

  constructor() {
    this._id = '';
  }
}
