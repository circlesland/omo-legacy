import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function addCommitment(dreamId:string) {
  return new ProcessBuilder<IProcessContext>("flows:omo.dreams.addCommitment")
    .category("Invite someone to dream with you", (build) =>
      build

        .step("flows:omo.dreams.addCommitment:confirm")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "yesNo")
        .withQuant("OmoInput") // TODO: Add OmoYesNo
        .withPrompt("Yes/No")
        .withTitle("Are you sure?")

        .step("flows:omo.dreams.addCommitment:addCommitment")
        .withSideEffect("sideEffects:omo.dreams.addCommitment")
        .withStaticInput("dreamId", dreamId)
        .isNonInteractive()
        .withTitle("Creating your reservation..")
    ).end()
    .build();
}
