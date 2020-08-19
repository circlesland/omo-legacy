import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function addAuthProviderMail()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.safe.addAuthProviderMail")
    .category("Connect email authentication", (build) =>
      build

        .step("flows:omo.safe.addAuthProviderMail:getEmailAddress")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("OmoInput")
        .withTitle("Set email you want to connect")

        .step("flows:omo.safe.addAuthProviderMail:waitForMagicLink")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("MagicLogin")
        .withTitle("Wait for magic link")

        .step("flows:omo.safe.addAuthProviderMail:welcome")
        .withQuant("OmoStatusResponse")
        .withTitle("Welcome you are logged in")
    )
    .end()
    .build();
}
