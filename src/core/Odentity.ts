import { OdentityEntity } from "./Data/Entities/OdentityEntity";
import { Threads } from "./Textile/Threads";
import { OdentityProvider } from "./Data/Entities/OdentityProvider";
import { LoginRequest } from "./Data/Entities/LoginRequest";
import { QueryJSON } from "@textile/threads-client";
import { EmailProvider } from "./Identity/EmailProvider";
import { Libp2pCryptoIdentity } from "@textile/threads-core";
import { IdentityProviderInterface } from "./Identity/IdentityProviderInterface";
import { navigate } from "../Router";
import { RemoteCollection } from "./Textile/RemoteCollection";
import { RemoteThread } from "./Textile/RemoteThread";
import { CirclesProvider } from "./Identity/CirclesProvider";
import { Account } from "web3-core";

export class Odentity {
  private static THREADNAME = "ODENTITY";
  private static STORAGE = "ODENTITY";
  private static _instance: Odentity;

  private odentityCollection: RemoteCollection<OdentityEntity>;
  private odentityProviderCollection: RemoteCollection<OdentityProvider>;
  private loginRequestCollection: RemoteCollection<LoginRequest>;

  private _current: OdentityEntity | null;
  private provider = {
    email: EmailProvider,
    circles: CirclesProvider
  }

  /**
   * Restores a odentity from BrowserStorage
   */
  private static async restoreOdentity(): Promise<OdentityEntity | null> {
    var restored = localStorage.getItem(Odentity.STORAGE);
    if (restored !== null) return JSON.parse(restored);
    return null;
  }

  static async init(threads: Threads): Promise<Odentity> {
    if (this._instance == undefined) {
      var restored = await this.restoreOdentity();
      let odentityThread = process.env.ODENTITY ? await RemoteThread.byThreadID(process.env.ODENTITY) : await RemoteThread.init("ODENTITY");
      let odentityCollection = await odentityThread.getCollection<OdentityEntity>("odentity");
      let providerCollection = await odentityThread.getCollection<OdentityProvider>("odentityProvider");
      let loginReqCollection = await odentityThread.getCollection<LoginRequest>("loginRequest");
      this._instance = new Odentity(restored, odentityCollection, providerCollection, loginReqCollection);
    }
    return this._instance;
  }

  async getSafe(id: string) {
    return await this.odentityCollection.findById(id);
  }

  static async createSchemas(threads: Threads): Promise<Odentity> {
    if (this._instance == undefined) {
      var restored = await this.restoreOdentity();
      let odentityThread = process.env.ODENTITY ? await RemoteThread.byThreadID(process.env.ODENTITY) : await RemoteThread.init("ODENTITY");
      let odentityCollection = await odentityThread.getOrCreateCollection<OdentityEntity>("odentity", Odentity);
      let providerCollection = await odentityThread.getOrCreateCollection<OdentityProvider>("odentityProvider", OdentityProvider);
      let loginReqCollection = await odentityThread.getOrCreateCollection<LoginRequest>("loginRequest", LoginRequest);
      this._instance = new Odentity(restored, odentityCollection, providerCollection, loginReqCollection);
    }
    return this._instance;
  }

  private constructor(odentity: OdentityEntity | null, odentityCollection: RemoteCollection<OdentityEntity>, providerCollection: RemoteCollection<OdentityProvider>, loginReqCollection: RemoteCollection<LoginRequest>) {
    this._current = odentity;
    this.odentityCollection = odentityCollection;
    this.odentityProviderCollection = providerCollection;
    this.loginRequestCollection = loginReqCollection;
  }

  get current(): OdentityEntity | null {
    return this._current;
  }

  async login(reference: string, type: string, callback: any) {
    var odentityProvider = await this.createOdentityProviderIfNotExist(reference, type);
    var request = await this.createLoginRequest(odentityProvider);
    var provider: IdentityProviderInterface = new this.provider[type]();
    var odentity = await provider.login(request, odentityProvider);
    if (odentity != null) {
      this._current = odentity;
      localStorage.setItem(Odentity.STORAGE, JSON.stringify(odentity));
      request.verified = true;
      callback(request);
    }
    else {
      this.loginRequestCollection.observeUpdate(["SAVE"], request._id, async (request: LoginRequest) => {
        if (odentityProvider.odentityId) {
          var odentity = await this.odentityCollection.findById(odentityProvider.odentityId);
          localStorage.setItem(Odentity.STORAGE, JSON.stringify(odentity));
          this._current = odentity;
          callback(request);
        }
      });
    }
  }

  logout() {
    this._current = null;
    localStorage.removeItem(Odentity.STORAGE);
    navigate("home", null, "");
  }

  async acceptLoginRequest(id: string) {
    var request = await this.loginRequestCollection.findById(id);
    request.verified = true;
    await this.loginRequestCollection.save(request);
  }

  private async createLoginRequest(odentityProvider: OdentityProvider) {
    var request = new LoginRequest();
    request.odentityProviderId = odentityProvider._id;
    request.timestamp = Math.round(+new Date() / 1000).toString();
    return await this.loginRequestCollection.create(request);
  }

  private async createOdentityProvider(odentity: OdentityEntity, identityReference: string, type: string): Promise<OdentityProvider> {
    var provider = new OdentityProvider();
    provider.externalReference = identityReference;
    provider.type = type;
    provider.odentityId = odentity._id;
    return await this.odentityProviderCollection.create(provider);
  }

  private async createOdentity(): Promise<OdentityEntity> {
    var odentity = new OdentityEntity();
    odentity.cryptoIdentity = (await Libp2pCryptoIdentity.fromRandom()).toString();
    odentity = await this.odentityCollection.create(odentity);
    return odentity;
  }

  private async createOdentityProviderIfNotExist(identityReference: string, type: string): Promise<OdentityProvider> {
    var query: QueryJSON = {
      ands: [
        { fieldPath: "externalReference", value: { string: identityReference } },
        { fieldPath: "type", value: { string: type } }
      ]
    };

    var instances = await this.odentityProviderCollection.find(query);
    if (instances.length == 0) {
      var odentity = await this.createOdentity();
      return await this.createOdentityProvider(odentity, identityReference, type);
    }
    return instances[0];
  }

  async connectCircleWallet(safeOwner: Account, safeAddress: string) {
    if (this._current == null)
      throw new Error("You are not logged in");
    this._current.circleSafe = { safeAddress: safeAddress };
    this._current.circleSafeOwner = safeOwner;
    localStorage.setItem(Odentity.STORAGE, JSON.stringify(this._current));
    await this.odentityCollection.save(this._current);
  }
}
