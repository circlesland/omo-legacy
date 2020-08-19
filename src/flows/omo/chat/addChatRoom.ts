import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function addChatRoom()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.chat.addChatRoom")
    .category("Add new chat room", (build) =>
      build

        .step("flows:omo.chat.addChatRoom:addRoom")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("OmoInput")
        .withTitle("Name the chat room")
    )
    .end()
    .build();
}
