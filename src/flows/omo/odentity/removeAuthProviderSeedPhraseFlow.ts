import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function removeAuthProviderSeedPhrase()
{
  return new ProcessBuilder<IProcessContext>(
    "flows:omo.safe.removeAuthProviderSeedPhrase"
  )
    .category("Remove email authentication", (build) =>
      build

        .step("flows:omo.safe.removeAuthProviderSeedPhrase:seed")
        .withQuant("OmoSelect")
        .withTitle("Select Seed you want to remove")

        .step("flows:omo.safe.removeAuthProviderSeedPhrase:remove")
        .withQuant("OmoStatusResponse")
        .withTitle("Removed Email Successfully")
    )
    .end()
    .build();
}
