import { IdentityProviderInterface } from "./IdentityProviderInterface";
import { OdentityEntity } from "../Data/Entities/OdentityEntity";
import { LoginRequest } from "../Data/Entities/LoginRequest";
import { OdentityProvider } from "../Data/Entities/OdentityProvider";
import { RemoteThread } from "../Textile/RemoteThread";
import { Odentity } from "../Odentity";
import ApolloClient, { gql } from "apollo-boost";
import { query } from "svelte-apollo";
import { mnemonicToEntropy } from "bip39";

export class CirclesProvider implements IdentityProviderInterface {
  async login(
    loginRequest: LoginRequest,
    providerIdentity: OdentityProvider
  ): Promise<OdentityEntity | null> {
    let odentityThread = process.env.ODENTITY
      ? await RemoteThread.byThreadID(process.env.ODENTITY)
      : await RemoteThread.init("ODENTITY");
    let odentityCollection = await odentityThread.getOrCreateCollection<
      OdentityEntity
    >("odentity", Odentity);
    if (
      providerIdentity.odentityId == null ||
      providerIdentity.externalReference == null
    )
      return null;

    var odentity = await odentityCollection.findById(
      providerIdentity.odentityId
    );
    let restoredKey = mnemonicToEntropy(providerIdentity.externalReference);
    let privateKey = `0x${restoredKey}`;
    let safeOwner = window.o.web3.eth.accounts.privateKeyToAccount(privateKey);
    let safeAddress = await this.getSafeAddressAsync(safeOwner);
    odentity.circleSafeOwner = {
      address: safeOwner.address,
      privateKey: safeOwner.privateKey,
    };
    odentity.circleSafe = { safeAddress: safeAddress };
    return odentity;
  }

  client = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/circlesubi/circles",
  });

  async getSafeAddressAsync(safeOwner) {
    let safeOwnerAddress = safeOwner.address.toLowerCase();
    let queryResult = query(this.client, {
      query: this.querySafeAddressFromSafeOwner(safeOwnerAddress),
    });
    let safeAddress = (await queryResult.result()).data.users[0].safes[0].id;
    return await safeAddress;
  }

  querySafeAddressFromSafeOwner(safeOwnerAddress) {
    return gql`
      {
        users(where: { id: "${safeOwnerAddress}" }) {
          id
          safes {
            id
          }
        }
      }
    `;
  }
}
