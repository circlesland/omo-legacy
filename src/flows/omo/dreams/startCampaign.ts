import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function startCampaign() {
  return new ProcessBuilder<IProcessContext>("flows:omo.dreams.startCampaign")
    .category("Convert dream to product", (build) =>
      build
        /*
        .step("flows:omo.dreams.startCampaign:uploadVideo")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "videoHash")
        .withQuant("OmoInput")
        .withPrompt("Video URL")
        .withTitle("Link to your video")*/

        // .step("flows:omo.dreams.startCampaign:uploadBanner")
        //   .withSideEffect("sideEffects:omo.shell.collectStepResult")
        //   .mapOutput("stepResult", "bannerHash")
        //   .withQuant("OmoInput")
        //   .withPrompt("Banner URL")
        //   .withTitle("Link to your banner")

        .step("flows:omo.dreams.startCampaign:price")
        .withSideEffect("sideEffects:omo.shell.collectStepResult")
        .mapOutput("stepResult", "price")
        .withQuant("OmoInput")
        .withPrompt("Price (one Circle = 1€)")
        .withTitle("Price your product (Circles per week)")

        .step("flows:omo.dreams.startCampaign:startCampaign")
        .withQuant("OmoLoading")
        // .mapInput("videoHash", "videoHash")
        // .mapInput("bannerHash", "bannerHash")
        .mapInput("price", "price")
        .isNonInteractive()
        .withSideEffect("sideEffects:omo.dreams.startCampaign")
    )
    .end()
    .build()
}