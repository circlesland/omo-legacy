<script>
  export let items = "[]";
  export let current = 0;
  $: navitems = JSON.parse(items);

  import { onMount } from "svelte";

  const handleClick = (tabValue) => () => (current = tabValue);
</script>

<style>
  .active {
    @apply bg-primary text-white;
  }
</style>

<aside
  class="flex flex-col items-center bg-gray-200 text-gray-700 shadow h-full">

  <ul>
    {#each navitems as item, i}
      <li>
        <button
          on:click={handleClick(i)}
          class="{item.design} h-12 w-12 px-6 flex justify-center items-center
          hover:bg-primary hover:text-white"
          class:active={current == i}>
          <i class="text-lg fas {item.icon}" />
        </button>
      </li>
    {/each}
  </ul>
</aside>
