<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms.svelte";
  import {ProcessNode} from "../../core/Flows/ProcessNode";
  import {Logger} from "../../core/Log/logger";
  import {onDestroy, onMount} from "svelte";
  import {SubmitFlowStep} from "../../events/omo/shell/submitFlowStep";
  import {RequestSubmitFlowStep} from "../../events/omo/shell/requestSubmitFlowStep";
  import {ClosePopup} from "../../events/omo/shell/closePopup";

  export let processNode = {};

  let subscription = null;
  let log = "";
  let executionContext;

  let defaultInputs = [{
    name: "currentSafeOwner",
    type: "schema:omo.safe.safeOwner",
    value: () => window.o.odentity.current.circleSafeOwner
  }, {
    name: "currentSafe",
    type: "schema:omo.safe.safe",
    value: () => window.o.odentity.current.circleSafe
  }]

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  let currentlyActiveNode;

  onMount(() => {
    let notifications = window.o.eventBroker.tryGetTopic("omo", "shell");
    subscription = notifications.observable.subscribe(event => {
      if (!event._$schemaId) return;

      switch (event._$schemaId) {
        case "events:omo.shell.submitFlowStep":
          if (!event.data.processNodeId === processNode.id) {
            return; // Not meant for our executing flow
          }
          next(processNode, event.data.argument);
          break;
        case "events:omo.shell.undoFlowStep":
          break;
        case "events:omo.shell.log":
          if (event.data.dataJson) {
            log += new Date().toJSON() + " | " + event.data.severity + " | " + event.data.source + " | " + event.data.message + " | " + event.data.dataJson + "\n";
          } else {
            log += new Date().toJSON() + " | " + event.data.severity + " | " + event.data.source + " | " + event.data.message + "\n";
          }
          break;
      }
    });
  });

  let layoutWithNext = {
    areas: "'aside content' 'foot foot'",
    columns: "400px 1fr",
    rows: "1fr 3rem"
  };
  let layoutWithoutNext = { // TODO: The molecule shouldn't be shown when it has no layout slot.
    areas: "'aside content'",
    columns: "400px 1fr",
    rows: "1fr"
  };

  let organisms = {
    name: "OmoSafe",
    type: "organisms",
    layout: layoutWithNext,
    blocks: [
      {
        type: "molecule",
        slot: "aside",
        quant: "OmoDialogSteps",
        data: processNode
      },
      {
        type: "molecule",
        slot: "content",
        quant: "OmoStatusResponse",
        data: {}
      },
      {
        type: "molecule",
        slot: "foot",
        quant: "OmoNextButton",
        data: {
          processNode: processNode,
          label: "Next"
        }
      }
    ]
  };

  function onNewProcessNode(processNode) {
    const copy = JSON.parse(JSON.stringify(processNode));
    ProcessNode.restoreParentLinks(copy);

    organisms.blocks[0].data = processNode;

    let activeLeaf = ProcessNode.findActiveLeaf(copy);
    if (activeLeaf && activeLeaf.quant) {
      organisms.blocks[1].quant = activeLeaf.quant;
      organisms.blocks[1].data = {
        processNode,
        ...activeLeaf.quantData
      };
      organisms.blocks[2].data = {
        processNode: processNode,
        label: activeLeaf.submitButtonLabel,
        log: log
      };
    }

    if (isNewProcess(processNode)) {
      const activatedNodeId = initProcess(processNode);

      activeLeaf = ProcessNode.findById(copy, activatedNodeId);
      if (activeLeaf && activeLeaf.quant) {
        organisms.blocks[1].quant = activeLeaf.quant;
        organisms.blocks[1].data = {
          processNode,
          ...activeLeaf.quantData
        };
        organisms.blocks[2].data = {
          processNode: processNode,
          label: activeLeaf.submitButtonLabel,
          log: log
        };
      }
    }
  }

  $: {
    onNewProcessNode(processNode);
  }

  /**
   * Checks if the supplied ProcessNode is a pristine ProcessNode.
   * @param processNode {ProcessNode}
   * @returns {boolean}
   */
  function isNewProcess(processNode) {
    const activeBranch = !ProcessNode.findActiveBranch(processNode);
    if (!activeBranch) {
      // pristine process, set initial active node
      const usedNodes = ProcessNode.flattenSequencial(processNode).filter(
              o => o.state !== "Pristine"
      );
      return usedNodes.length === 0;
    }
    return false;
  }

  /**
   * Initializes a new ProcessNode by setting the first leaf node to "Active".
   * @param processNode {ProcessNode}
   * @returns {string} The id of the activated node.
   */
  function initProcess(processNode) {
    const flatLeafs = ProcessNode.flattenSequencial(processNode);

    if (!flatLeafs || flatLeafs.length === 0) {
      throw new Error(
              "A non executable or empty 'processNode' was supplied to 'OmoDialog'."
      );
    }
    const first = flatLeafs[0];
    first.state = "Active";
    executionContext = {
      o: window.o,
      local: {
        stepId: first.stepId,
        processNodeId: processNode.id,
        inputs: {},
        outputs: {}
      },
      global: {}
    };
    return first.id;
  }

  /**
   * Sets the current node to "Finish" and proceeds with the next executable leaf node.
   */
  async function next(processNode, argument) {

    const oldOrg = organisms;
    organisms = false;

    setTimeout(() => {
      organisms = oldOrg;
    });

    // We need to work with a copy of the tree because OmoOrganism doesn't like circular references
    // (specifically the 'parent' property of the ProcessNode)
    const copy = JSON.parse(JSON.stringify(processNode));

    // Because OmoDialog received the ProcessNode as JSON copy as well, the parent links must
    // be restored from the node IDs first.
    ProcessNode.restoreParentLinks(copy);

    if (isNewProcess(copy)) {
      throw new Error("You must first call 'initProcess()'.");
    }

    // Find the active and next leaf in the copy with the restored 'parent' properties ..
    let currentlyActiveNode_ = ProcessNode.findActiveLeaf(copy);
    if (!currentlyActiveNode_) {
      throw new Error("Couldn't find a currently active node.")
    }
    let nextNode_ = ProcessNode.findNextNode(copy, currentlyActiveNode_.id);

    Logger.log(processNode.id + ":OmoDialog", "Executing current step ('" + currentlyActiveNode.stepId + "') and moving to next ('" + !nextNode_ ? "<end>" : nextNode_.stepId + "').");

    // .. then use the IDs to look up the "real" node and execute its side-effect (if any)
    const currentlyActiveNode = ProcessNode.findById(processNode, currentlyActiveNode_.id);
    executionContext.local.stepId = currentlyActiveNode.stepId;

    if (currentlyActiveNode.sideEffect) {
      const sideEffect = window.sideEffectRegistrar.get(currentlyActiveNode.sideEffect);

      if (!sideEffect) {
        throw new Error("Couldn't find sideEffect '" + currentlyActiveNode.sideEffect + "' in flow step '" + currentlyActiveNode.stepId + "'. Maybe it's not registered?!");
      }

      // Check if there is a side effect and if it can be executed
      if (sideEffect
              && (!sideEffect.canExecute ? true : (await sideEffect.canExecute(executionContext, argument)))
              && sideEffect.execute) {
        try {
          Logger.log(processNode.id + ":OmoDialog", "Executing SideEffect '" + currentlyActiveNode.sideEffect + "'...");

          // Map all inputs to the 'local' scope
          currentlyActiveNode.inputMap.forEach(inputMap =>
          {
            Logger.log(processNode.id + ":OmoDialog", "Mapping " + currentlyActiveNode.sideEffect + "' input '" + inputMap.globalName + "' to '" + inputMap.localName + "'");

            let globalValue = executionContext.global[inputMap.globalName];
            if (!globalValue) {
              // Look if the default values can satisfy
              let globalValueFactory = defaultInputs.find(o => o.name === inputMap.globalName);
              if (globalValueFactory)
                globalValue = globalValueFactory.value();
            }

            Logger.log(processNode.id + ":OmoDialog", "Mapping " + currentlyActiveNode.sideEffect + "' input '" + inputMap.globalName + "' to '" + inputMap.localName + "'. Global value:", globalValue);

            if (!globalValue) {
              throw new Error("Couldn't find a matching input value for sideEffect '" + currentlyActiveNode.sideEffect + "' in step '" + currentlyActiveNode.stepId + "'. Requested globalName: " + inputMap.globalName);
            }
            executionContext.local.inputs[inputMap.localName] = globalValue;
          });

          currentlyActiveNode.staticInputs.forEach(staticValue => {
            executionContext.local.inputs[staticValue.localName] = staticValue.value;
          });

          await sideEffect.execute(executionContext, argument);

          // Map all results to the 'global' scope
          currentlyActiveNode.outputMap.forEach(outputMap => {
            Logger.log(processNode.id + ":OmoDialog", "Mapping " + currentlyActiveNode.sideEffect + "' output '" + outputMap.globalName + "' to '" + outputMap.localName + "'");
            const localValue = executionContext.local.outputs[outputMap.localName];
            Logger.log(processNode.id + ":OmoDialog", "Mapping " + currentlyActiveNode.sideEffect + "' output '" + outputMap.globalName + "' to '" + outputMap.localName + "'. Local value:", localValue);
            executionContext.global[outputMap.globalName] = localValue;
          });
          currentlyActiveNode.state = "Succeeded";
        } catch (e) {
          currentlyActiveNode.state = "Failed";
          currentlyActiveNode.error = e;
          Logger.error("OmoDialog:" + processNode.id, "Execution of side effect '" + currentlyActiveNode.sideEffect + "' failed:", e);
          throw e;
        }
      }
    }

    if (!nextNode_) {
      window.o.publishShellEventAsync(new ClosePopup());
      return;
    }

    const nextNode = ProcessNode.findById(processNode, nextNode_.id);

    currentlyActiveNode.state = "Succeeded";
    nextNode.state = nextNode.isInteractive ? "Active" : "Working";

    // If the nextNode has a 'quant' set, use it.
    // If not, stay with the current quant.
    if (nextNode && nextNode.quant) {
      oldOrg.blocks[1].quant = nextNode.quant;
      oldOrg.blocks[1].data = {
        processNode,
        ...nextNode.quantData
      };
      oldOrg.blocks[2].data = {
        processNode: processNode,
        label: nextNode.submitButtonLabel,
      };
    }
    if (!nextNode.isInteractive) {
      oldOrg.layout = layoutWithoutNext;
      oldOrg.blocks[2].quant = undefined;
    } else {
      oldOrg.layout = layoutWithNext;
      oldOrg.blocks[2].quant = "OmoNextButton";
    }

    setTimeout(() => {
      organisms = oldOrg;
    }, 1);

    if (!nextNode.isInteractive) {
      setTimeout(() => {
        next(processNode, argument);
      }, 1);
    }
  }
</script>

{#if organisms}
  <OmoOrganisms {organisms}/>
{/if}
