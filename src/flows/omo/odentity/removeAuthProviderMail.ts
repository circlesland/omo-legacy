import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function removeAuthProviderMail()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.safe.removeAuthProviderMail")
    .category("Remove email authentication", (build) =>
      build

        .step("omo.odentity.removeAuthProviderMail")
        .withQuant("OmoSelect")
        .withTitle("Select email you want to remove")

        .step("omo.odentity.removeAuthProviderMail")
        .withQuant("OmoStatusResponse")
        .withTitle("Removed Email Successfully")
    )
    .end()
    .build();
}
