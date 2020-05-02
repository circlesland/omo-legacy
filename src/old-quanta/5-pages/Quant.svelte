<script>
  // import quanta from "./../../4-data/quanta.js";
  // import OmoMenuVertical from "./../2-molecules/OmoMenuVertical.svelte";

  // export let currentId;
  // let quant = $quanta.find(item => item.id == currentId);
  let thing = { name: "foo", type: "bar", test: "testme" };
</script>

<style>
  .bg-image {
    background: url("/images/grid.png");
    background-size: repeat;
    background-position: center;
  }
</style>

<div class="h-full w-full flex">
  <div class="bg-image w-full p-10 overflow-hidden overflow-y-scroll">
    <svelte:component this={quant.component} {quant} />
  </div>
  <div
    class="p-6 h-full overflow-hidden overflow-y-scroll bg-gray-100 border-l
    border-gray-300"
    style="width: 300px">
    <div class="mb-4">
      <div class="text-sm uppercase text-blue-900 font-title font-bold">
        Context Properties
      </div>
      <div class="flex flex-wrap">
        {#each Object.entries(quant.model) as [key, value]}
          <!-- {#if key === 'image'}
            <img src={value} class="rounded mb-1" />
          {/if} -->
          {#if key != 'id' && key != 'image'}
            <label class="text-gray-500 text-xs">{key}</label>
            <input
              class="w-full text-sm text-blue rounded border border-gray-300
              px-2 py-1"
              type="text"
              {value} />
          {/if}
        {/each}
      </div>
    </div>
    <div class="mb-4">
      <div class="text-sm uppercase text-blue-900 font-title font-bold">
        Quant Design
      </div>
      {#each Object.entries(quant.design) as [key, value]}
        {#if key != 'id'}
          <div>
            <label class="text-gray-500 text-xs">{key}</label>
            <input
              class="w-full text-sm text-blue rounded border border-gray-300
              px-2 py-1"
              type="text"
              {value} />
          </div>
        {/if}
      {/each}
    </div>
    <div class="mb-4">
      <div class="text-sm uppercase text-blue-900 font-title font-bold">
        Quant Data
      </div>
      {#each Object.entries(quant.data) as [key, value]}
        {#if key != 'id'}
          <div>
            <label class="text-gray-500 text-xs">{key}</label>
            <input
              class="w-full text-sm text-blue rounded border border-gray-300
              px-2 py-1"
              type="text"
              {value} />
          </div>
        {/if}
      {/each}
    </div>

  </div>
  <!-- <OmoMenuVertical /> -->
</div>
