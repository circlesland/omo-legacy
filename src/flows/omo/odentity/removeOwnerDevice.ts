import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function removeOwnerDevice()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.safe.removeOwnerDevice")
    .category("Remove owner device", (build) =>
      build

        .step("flows:omo.safe.removeOwnerDevice:getDevice")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("OmoSelect")
        .withTitle("Select device you want to remove")

        .step("flows:omo.safe.removeOwnerDevice:removeDevice")
        .withSideEffect("omo.safe.giveTrust")
        .withQuant("OmoStatusResponse")
        .withTitle("Removed Owner Device")
    )
    .end()
    .build();
}
