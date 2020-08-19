import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function sendMessage()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.chat.sendMessage")
    .category("Add new message", (build) =>
      build

        .step("flows:omo.chat.sendMessage:send")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("OmoInput")
        .withTitle("Send message")
    )
    .end()
    .build();
}
