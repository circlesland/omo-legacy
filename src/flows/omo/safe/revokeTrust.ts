import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function revokeTrust()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.safe.revokeTrust")
    .category("Trust someone", build =>
      build

        .step("flows:omo.safe.revokeTrust:trustReceivingSafe")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "trustReceivingSafe")
        .withQuant("OmoInput")
        .withTitle("Enter safe address to un-trust")

        .step("flows:omo.safe.revokeTrust:revokeTrust")
        .withSideEffect("sideEffects:omo.safe.revokeTrust")
        .withQuant("OmoLoading")
        .isNonInteractive()
        .mapInput("trustGivingSafeOwner", "currentSafeOwner")
        .mapInput("trustGivingSafe", "currentSafe")
        .mapInput("trustReceivingSafe", "trustReceivingSafe")
        .withTitle("Review & confirm")
    )
    .end()
    .build();
}
