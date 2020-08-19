import { IdentityProviderInterface } from "./IdentityProviderInterface";
import { OdentityEntity } from "../Data/Entities/OdentityEntity";
import { LoginRequest } from "../Data/Entities/LoginRequest";
import { OdentityProvider } from "../Data/Entities/OdentityProvider";

export class EmailProvider implements IdentityProviderInterface {
  async login(loginRequest: LoginRequest, providerIdentity: OdentityProvider): Promise<OdentityEntity | null> {
    window['Email'].send({
      Host: process.env.SMTPHOST,
      Username: process.env.SMTPUSER,
      Password: process.env.SMTPPASSWORD,
      To: providerIdentity.externalReference,
      From: 'team@omo.earth',
      Subject: `Magic login link`,
      Body: `Please follow this link to <a target="_blank" href="${window.location.protocol}//${window.location.host}/magic.html?&accept=${loginRequest._id}">login</a>`
    }).then(
      message => console.log("MAIL", message)
    )
    // Email cannot login directly so this has to be handled by Listenig to Request Changes
    return null;
  }
}
