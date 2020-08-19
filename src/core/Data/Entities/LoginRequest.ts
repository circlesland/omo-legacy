import { Instance } from "@textile/threads-store";

export class LoginRequest implements Instance {
  static CollectionName: string = "LoginRequest";

  _id: string;
  odentityProviderId?: string;
  timestamp?: string;
  verified: boolean;

  constructor() {
    this._id = '';
    this.verified = false;
  }
}
