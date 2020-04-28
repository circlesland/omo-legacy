<script>
  import OmoQuantaItem from "./OmoQuantaItem.svelte";
  import quanta from "./../../4-data/quanta.js";
</script>

<div class="ml-4 grid grid-cols-1 mr-4 mt-4">
  <div class="text-sm uppercase text-blue-900 font-title font-bold">
    Context Relations
  </div>
  {#each $quanta as quant}
    <a href="quant?id={quant.id}" class="cursor-pointer">
      <div
        class="mb-2 text-sm text-blue-900 rounded border-gray-200 border
        bg-white px-4 py-2">
        {quant.model.name}
        <br />
        <span class="text-gray-500 text-xs">
          {quant.model.group}-{quant.model.type}s-{quant.model.tags}s
        </span>
      </div>
    </a>
  {/each}
</div>
