import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function giveTrust()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.safe.giveTrust")
    .category("Trust someone", build =>
      build
        .step("flows:omo.safe.giveTrust:trustReceivingSafe")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "trustReceivingSafe")
        .withQuant("OmoInput")
        .withPrompt("Safe address")
        .withTitle("Enter the safe address to give trust to")

        .step("flows:omo.safe.giveTrust:trustReceivingSafe")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "trustReceivingPercentage")
        .withQuant("OmoInput")
        .withPrompt("Trust percentage")
        .withTitle("How much do you trust that person (in percent)?")

        .step("flows:omo.safe.giveTrust:giveTrust")
        .withSideEffect("sideEffects:omo.safe.giveTrust")
        .mapInput("trustGivingSafeOwner", "currentSafeOwner")
        .mapInput("trustGivingSafe", "currentSafe")
        .mapInput("trustReceivingSafe", "trustReceivingSafe")
        .mapInput("trustPercentage", "trustReceivingPercentage")
        .withQuant("OmoLoading")
        .isNonInteractive()
        .withTitle("Review & confirm")
    )
    .end()
    .build();
}
