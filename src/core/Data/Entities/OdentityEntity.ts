import { Instance } from "@textile/threads-store";
import { ThreadID } from "@textile/hub";

export class OdentityEntity implements Instance {
  static CollectionName: string = "OdentityEntity";

  _id: string;
  threadId: string;
  cryptoIdentity?: string;
  circleSafe?: { safeAddress: string; };
  circleSafeOwner?: { address: string, privateKey: string };

  constructor() {
    this._id = "";
    this.threadId = (ThreadID.fromRandom()).toString();
  }
}
