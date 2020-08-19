import {ProcessBuilder} from "../../../core/Flows/ProcessBuilder";
import {IProcessContext} from "../../../core/Flows/IProcessContext";

export function addOwnerDevice()
{
  return new ProcessBuilder<IProcessContext>("flows:omo.odentity.addOwnerDevice")
    .category("Add new owner device", (build) =>
      build

        .step("flows:omo.odentity.addOwnerDevice:getDevice")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("OmoInput")
        .withTitle("Name the device you want to add")

        .step("flows:omo.odentity.addOwnerDevice:scanQrCode")
        .withSideEffect("omo.shell.collectUserValue")
        .withQuant("OmoInput")
        .withTitle("Scan QR-Code with 2nd Device")

        .step("flows:omo.odentity.addOwnerDevice:trustDevice")
        .withSideEffect("omo.safe.giveTrust")
        .withQuant("OmoStatusResponse")
        .withTitle("Added new Owner Device")
    )
    .end()
    .build();
}
