<script>
  import OmoSpin from "./../1-atoms/OmoSpin.svelte";
  import {ProcessNode} from "../../core/Flows/ProcessNode";

  let items = [];

  function refreshTree(processNode) {
    if (!processNode.children) {
      return [];
    }

    ProcessNode.restoreParentLinks(processNode);

    return processNode.children.map(node => {
      return {
        title: !node.title ? node.stepId : node.title,
        level: 1,
        steps: node.children.map((o, i) => {
          return {
            title: !o.title ? o.stepId : o.title,
            state: o.state,
            step: i + 1
          };
        })
      };
    });
  }

  export let data = {};

  $: {
    items = refreshTree(data);
  }
</script>

<style>
  section {
    height: 70vh;
  }
</style>

<section class="omo-left py-6 px-8 text-md bg-gray-100 overflow-y-scroll">
  {#each items.sort((first, second) => {
  if (first.level < second.level) return -1;
  if (first.level > second.level) return 1;
  return 0;
  }) as level, i}
    <p class="uppercase text-md font-bold text-gray-600">
      {level.level}. {level.title}
    </p>
    {#each level.steps.sort((first, second) => {
    if (first.step < second.step) return -1;
    if (first.step > second.step) return 1;
    return 0;
    }) as step, i}
      {#if step.state == 'Locked' || step.state == 'Pristine'}
        <div class="flex flex-col justify-center bg-gray-300 h-12 mb-4 w-full">
          <div class="text-center">
            <i class="fas fa-lock text-gray-500"/>
          </div>
        </div>
      {:else if step.state == 'Active'}
        <div
                class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800
          hover:bg-primary hover:text-white">
          <div
                  class="h-12 w-12 py-2 px-4 text-xl bg-primary text-white font-bold">
            {step.step}
          </div>
          <p class="py-3 px-4 rounded w-full">{step.title}</p>
        </div>
      {:else if step.state == 'Working'}
        <div
                class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800
          hover:bg-primary hover:text-white">
          <div class="py-3 px-3 h-12 w-12 text-center bg-gray-200">
            <OmoSpin/>
          </div>
          <p class="py-3 px-2 rounded text-gray-500 w-full">{step.title}</p>
        </div>
      {:else if step.state == 'Succeeded'}
        <div
                class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800
          hover:bg-primary hover:text-white">
          <div class="py-2 px-4 h-12 w-12 text-xl bg-tertiary font-bold">
            <i class="fas fa-check-circle text-white"/>
          </div>
          <p class="py-3 px-4 rounded w-full">{step.title}</p>
        </div>
      {:else}
        <div
                class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800
          hover:bg-primary hover:text-white">
          <div class="py-3 h-12 w-12 text-center bg-red-400">
            <i class="fas fa-exclamation-triangle text-white"/>
          </div>
          <p class="py-3 px-4 rounded w-full">{step.title}</p>
        </div>
      {/if}
    {/each}
  {/each}
</section>
