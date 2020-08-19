import { OdentityEntity } from "../Data/Entities/OdentityEntity";
import { LoginRequest } from "../Data/Entities/LoginRequest";
import { OdentityProvider } from "../Data/Entities/OdentityProvider";

export interface IdentityProviderInterface {
  login(loginRequest: LoginRequest, providerIdentity: OdentityProvider): Promise<OdentityEntity | null>;
}
