/*
import { ProcessBuilder } from "../../../core/Flows/ProcessBuilder";
import { IProcessContext } from "../../../core/Flows/IProcessContext";

export function convertToProduct()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.dreams.convertToProduct")
    .category("Convert dream to product", (build) =>
      build
        .step("flows:omo.dreams.convertToProduct:uploadVideo")
          .withSideEffect("sideEffects:omo.shell.collectStepResult")
          .mapOutput("stepResult", "videoHash")
          .withQuant("OmoInput")
          .withPrompt("Video URL")
          .withTitle("Link to your video")

        .step("flows:omo.dreams.convertToProduct:uploadBanner")
          .withSideEffect("sideEffects:omo.shell.collectStepResult")
          .mapOutput("stepResult", "bannerHash")
          .withQuant("OmoInput")
          .withPrompt("Banner URL")
          .withTitle("Link to your banner")

        .step("flows:omo.dreams.convertToProduct:price")
          .withSideEffect("sideEffects:omo.shell.collectStepResult")
          .mapOutput("stepResult", "price")
          .withQuant("OmoInput")
          .withPrompt("Price (one Circle = 1€)")
          .withTitle("Price your product (Circles per week)")

        .step("flows:omo.dreams.convertToProduct:convertToProduct")
          .withQuant("OmoLoading")
          .mapInput("videoHash", "videoHash")
          .mapInput("bannerHash", "bannerHash")
          .mapInput("price", "price")
          .isNonInteractive()
          .withSideEffect("sideEffects:omo.dreams.convertToProduct")
    )
    .end()
    .build()
}
*/