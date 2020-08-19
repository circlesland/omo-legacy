import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function removeChatRoom()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.chat.removeChatRoom")
    .category("Remove Chat Room", (build) =>
      build

        .step("flows:omo.chat.removeChatRoom:selectRoom")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("OmoSelect")
        .withTitle("Select chat room you want to remove")

        .step("flows:omo.chat.removeChatRoom:removeRoom")
        .withSideEffect("omo.safe.giveTrust")
        .withQuant("OmoStatusResponse")
        .withTitle("Removed Chat Room")
    )
    .end()
    .build();
}
