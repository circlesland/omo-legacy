import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function inviteToDream(dream: any) {
  return new ProcessBuilder<IProcessContext>("flows:omo.dreams.inviteToDream")
    .category("Invite someone to dream with you", (build) =>
      build
        .step("flows:omo.dreams.inviteToDream:getInvitee")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "invitee")
        .withQuant("OmoInput")
        .withPrompt("Who do you want to invite")
        .withTitle("Invite someone")

        .step("flows:omo.dreams.inviteToDream:getEmail")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "email")
        .withQuant("OmoInput")
        .withPrompt("E-mail address")
        .withTitle("Can you give us the email adress?")

        .step("flows:omo.dreams.inviteToDream:getText")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "text")
        .withQuant("OmoInput")
        .withPrompt("Text")
        .withTitle("Write a short message to send with the invite, we will extend our template with this text")

        .step("flows:omo.dreams.inviteToDream:invite")
        .withQuant("OmoLoading")
        .mapInput("email", "email")
        .mapInput("text", "text")
        .mapInput("invitee", "invitee")
        .isNonInteractive()
        .withStaticInput("dreamId", dream._id)
        .withSideEffect("sideEffects:omo.dreams.inviteToDream")
    ).end()
    .build();
}
