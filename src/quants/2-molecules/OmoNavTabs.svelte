<script>
  import { onMount } from "svelte";

  export let items = [];
  export let activeTabValue;

  onMount(() => {
    // Set default tab value
    if (Array.isArray(items) && items.length && items[0].value) {
      activeTabValue = items[0].value;
    }
  });

  const handleClick = (tabValue) => () => (activeTabValue = tabValue);
</script>

<style>
  .active {
    @apply bg-white border-2 border-gray-300 rounded;
  }
</style>

<div class="min-h-full flex w-full max-w-xs p-4 overflow-y-scroll">
  <ul class="flex flex-col w-full">
    <!-- <li class="my-px">
          <span
            class="flex font-medium text-sm text-gray-400 px-4 my-4 uppercase">
           {item.category}
          </span>
        </li> -->
    {#if Array.isArray(items)}
      {#each items as item}
        <li
          on:click={handleClick(item.value)}
          class="flex flex-row items-center h-12 px-4 text-gray-600
          hover:bg-white hover:border-2 hover:border-gray-300 my-px {activeTabValue === item.value ? 'active' : ''}">
          <span class="flex items-center justify-center text-lg text-gray-400">
            <i class="text-lg fas {item.icon}" />
          </span>
          <span class="ml-3">{item.label}</span>
        </li>
      {/each}
    {/if}
  </ul>
</div>
