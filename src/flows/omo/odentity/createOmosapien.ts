import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function createOmosapien() {
  return new ProcessBuilder<IProcessContext>(
    "flows:omo.odentity.createOmosapien"
  )

    .category("Welcome", (b) => {
      b.step("flows:omo.odentity.createOmosapien:intro1")
        .withQuant("OmoIntro", {
          slide: {
            title: "Intro coming soon (alpha-test-demo)",
          },
        })
        .withTitle("Welcome Intro");
    })
    .end()
    .category("Create Omosapien", (b) => {
      b.step("flows:omo.odentity.createOmosapien:getName")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "name")
        .withQuant("OmoInput")
        .withPrompt("Name")
        .withTitle("Your name")

        .step("flows:omo.odentity.createOmosapien:generatePpk")
        .withSideEffect("sideEffects:omo.web3.generatePpk")
        .mapOutput("safeOwner", "safeOwner")
        .withTitle("Generate PPK")

        .step("flows:omo.odentity.createOmosapien:generateSafe")
        .withSideEffect("sideEffects:omo.circles.generateSafe")
        .mapInput("safeOwner", "safeOwner")
        .mapOutput("safe", "safe")
        .withTitle("Generate Gnosis Safe")

        .step("flows:omo.odentity.createOmosapien:connectSafe")
        .withSideEffect("sideEffects:omo.odentity.connectSafe")
        .mapInput("safeOwner", "safeOwner")
        .mapInput("safe", "safe")
        .withTitle("Connecting safe to odentity")

        .step("flows:omo.odentity.createOmosapien:createOmosapien")
        .withSideEffect("sideEffects:omo.odentity.createOmosapien")
        .mapInput("name", "name")
        .mapInput("safe", "safe")
        .withTitle("Creating your profile")

        .step("flows:omo.odentity.createOmosapien:giveInitialTrust")
        .withSideEffect("sideEffects:omo.circles.giveInitialTrust")
        .mapInput("safeOwner", "safeOwner")
        .mapInput("trustReceiverSafe", "safe")
        .withTitle("Give initial trust")

        .step("flows:omo.odentity.createOmosapien:deploySafe")
        .withSideEffect("sideEffects:omo.safe.deploySafe")
        .mapInput("safeOwner", "safeOwner")
        .mapInput("safe", "safe")
        .withTitle("Deploy Safe")

        .step("flows:omo.odentity.createOmosapien:deployToken")
        .withSideEffect("sideEffects:omo.safe.deployToken")
        .mapInput("safeOwner", "safeOwner")
        .mapInput("safe", "safe")
        .withTitle("Deploy Safe Token")

        .step("flows:omo.odentity.createOmosapien:revokeInitialTrust")
        .withSideEffect("sideEffects:omo.circles.revokeInitialTrust")
        .mapInput("trustReceiverSafe", "safe")
        .withTitle("Cleaning up")

        .step("flows:omo.odentity.createOmosapien:navigate")
        .withSideEffect("sideEffects:omo.shell.navigate")
        .withStaticInput("page", "omomarket")
        .withTitle("Finish process");
    })
    .end()
    .build();
}
