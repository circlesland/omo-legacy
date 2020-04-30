<script>
  import { curRoute } from "./../../router.ts";
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";
  export let quant;
</script>

<div class="bg-white w-full rounded border mb-2">
  <button
    on:click={curRoute.set(quant.route)}
    class="flex justify-between items-center hover:bg-green-400 hover:text-white">
    <div class="flex items-center">
      <i class="fas bg-gray-200 text-gray-700 p-3 {quant.icon}" />
      <div class="px-3 py-1 text-gray-700 text-sm">{quant.name}</div>
    </div>
  </button>
</div>
