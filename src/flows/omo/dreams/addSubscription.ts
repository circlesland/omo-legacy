import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function addSubscription(dreamId:string) {
  return new ProcessBuilder<IProcessContext>("flows:omo.dreams.addSubscription")
    .category("Invite someone to dream with you", (build) =>
      build
        .step("flows:omo.dreams.addSubscription:confirm")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "yesNo")
        .withQuant("OmoInput") // TODO: Add OmoYesNo
        .withPrompt("Yes/No")
        .withTitle("Do you want to subscribe the Dream with XX% discount?")

        .step("flows:omo.dreams.addReservation:addSubscription")
        .withSideEffect("sideEffects:omo.dreams.addReservation")
        .withStaticInput("dreamId", dreamId)
        .isNonInteractive()
        .withTitle("Creating your reservation..")
    ).end()
    .build();
}
