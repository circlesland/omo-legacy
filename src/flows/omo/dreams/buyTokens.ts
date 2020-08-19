import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function buyTokens(dreamId:string) {
  return new ProcessBuilder<IProcessContext>("flows:omo.dreams.buyTokens")
    .category("Invite someone to dream with you", (build) =>
      build
        .step("flows:omo.dreams.buyTokens:confirm")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "yesNo")
        .withQuant("OmoInput") // TODO: Add OmoYesNo
        .withPrompt("Yes/No")
        .withTitle("Do you want to buy tokens of Dream with XX% discount?")

        .step("flows:omo.dreams.buyTokens:buyTokens")
        .withSideEffect("sideEffects:omo.dreams.buyTokens")
        .withStaticInput("dreamId", dreamId)
        .isNonInteractive()
        .withTitle("Creating your reservation..")
    ).end()
    .build();
}
