import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function createOmosapienNameOnly() {
  return new ProcessBuilder<IProcessContext>("flows:omo.odentity.createOmosapienNameOnly")
    .category("Create Omosapien", b => {
      b
        .step("flows:omo.odentity.createOmosapienNameOnly:getName")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "name")
        .withQuant("OmoInput")
        .withPrompt("Name")
        .withTitle("Your name")

        .step("flows:omo.odentity.createOmosapien:createOmosapien")
        .withSideEffect("sideEffects:omo.odentity.createOmosapien")
        .mapInput("name", "name")
        .mapInput("safe", "currentSafe")
        .withTitle("Creating your profile")

        .step("flows:omo.odentity.createOmosapienNameOnly:navigate")
        .withSideEffect("sideEffects:omo.shell.navigate")
        .withStaticInput("page", "omomarket")
        .withTitle("Finish process")
    })
    .end()
    .build();
}
