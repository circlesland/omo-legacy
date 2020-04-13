<script>
  import OmoQuantaItem from "./../2-molecules/OmoQuantaItem.svelte";
  import quanta from "./../../4-data/quanta.js";
</script>

<div
  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4
  p-10">
  {#each $quanta as item}
    <OmoQuantaItem quant={item} />
  {/each}
</div>
