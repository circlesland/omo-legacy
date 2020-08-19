import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function addAuthProviderSeedPhrase()
{
  return new ProcessBuilder<IProcessContext>(
    "flows:omo.safe.addAuthProviderSeedPhrase"
  )
    .category("Add seedphrase authentication", (build) =>
      build

        .step("flows:omo.safe.addAuthProviderSeedPhrase:seedphrase")
        .withQuant("OmoInput")
        .withTitle("Connect (Circles) Seedphrase")

        .step("flows:omo.safe.addAuthProviderSeedPhrase:sucess")
        .withQuant("OmoStatusResponse")
        .withTitle("Added Seed successfully")
    )
    .end()
    .build();
}
