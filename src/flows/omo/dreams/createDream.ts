import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function createDream() {
  return new ProcessBuilder<IProcessContext>("flows:omo.dreams.createDream")
    .category("Create dream", (build) =>
      build
        .step("flows:omo.dreams.createDream:getName")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "dreamName")
        .withQuant("OmoInput")
        .withPrompt("Name")
        .withTitle("Give your dream a name")

        .step("flows:omo.dreams.createDream:getDescription")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "dreamDescription")
        .withQuant("OmoInput")
        .withPrompt("Description")
        .withTitle("Describe what you want to do (200 characters)")

        .step("flows:omo.dreams.createDream:getCity")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "cityName")
        .withQuant("OmoInput")
        .withPrompt("Where are you located")
        .withTitle("Where are you located (City)?")
    )
    .end()
    .category("Safe dream", (b) => {

      b.step("flows:omo.dreams.createDream:generateSafe")
        .withSideEffect("sideEffects:omo.circles.generateSafe")
        .mapInput("safeOwner", "currentSafeOwner")
        .mapOutput("safe", "safe")
        .withTitle("Generate Gnosis Safe")

        .step("flows:omo.dreams.createDream:createDream")
        .withQuant("OmoLoading")
        .mapInput("name", "dreamName")
        .mapInput("safe", "safe")
        .mapInput("dreamDescription", "dreamDescription")
        .mapInput("cityName", "cityName")
        .mapOutput("dreamId", "dreamId")
        .isNonInteractive()
        .withSideEffect("sideEffects:omo.dreams.createDream")
        .withTitle("Save dream to database")

        .step("flows:omo.dreams.createDream:giveInitialTrust")
        .withSideEffect("sideEffects:omo.circles.giveInitialTrust")
        .mapInput("safeOwner", "currentSafeOwner")
        .mapInput("trustReceiverSafe", "safe")
        .withTitle("Give initial trust")

        .step("flows:omo.dreams.createDream:deploySafe")
        .withSideEffect("sideEffects:omo.safe.deploySafe")
        .mapInput("safeOwner", "currentSafeOwner")
        .mapInput("safe", "safe")
        .withTitle("Deploy Safe")

        .step("flows:omo.dreams.createDream:deployToken")
        .withSideEffect("sideEffects:omo.safe.deployToken")
        .mapInput("safeOwner", "currentSafeOwner")
        .mapInput("safe", "safe")
        .withTitle("Deploy Safe Token")

        .step("flows:omo.dreams.createDream:revokeInitialTrust")
        .withSideEffect("sideEffects:omo.circles.revokeInitialTrust")
        .mapInput("trustReceiverSafe", "safe")
        .withTitle("Revoke Trust")

      .step("flows:omo.dreams.createDream:createChatRoom")
          .withSideEffect("sideEffects:omo.chat.createChatRoom")
          .mapInput("name", "dreamName")
          .mapInput("dreamId", "dreamId")
          .withTitle("Create Chatroom")

        .step("flows:omo.dreams.createDream:giveTrustToDreamSafe")
        .withSideEffect("sideEffects:omo.safe.giveTrust")
        .mapInput("trustGivingSafeOwner", "currentSafeOwner")
        .mapInput("trustGivingSafe", "currentSafe")
        .mapInput("trustReceivingSafe", "safe")
        .withStaticInput("trustPercentage", "100") // TODO: Allow for static values
        .isNonInteractive()
        .withTitle("Giving trust to dream-safe")

        .step("flows:omo.dreams.createDream:giveTrustToDreamCreator")
        .withSideEffect("sideEffects:omo.safe.giveTrust")
        .mapInput("trustGivingSafeOwner", "currentSafeOwner")
        .mapInput("trustGivingSafe", "safe")
        .mapInput("trustReceivingSafe", "currentSafe")
        .withStaticInput("trustPercentage", "100") // TODO: Allow for static values
        .isNonInteractive()
        .withTitle("Dream is giving trust to dream-creator")

      // TODO: dream-safe trusts creator-safe
    })
    .end()
    .build();
}
