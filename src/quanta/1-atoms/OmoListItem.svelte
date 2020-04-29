<script>
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";
  export let quant;
</script>

<div class="bg-white max-w-sm rounded border mb-2">
  <div class="flex justify-between items-center">
    <a href={quant.route} class="flex items-center">
      <i class="fas bg-gray-200 text-gray-700 p-3 {quant.icon}" />
      <div class="px-3 py-1 text-gray-700 text-sm">{quant.name}</div>
    </a>
  </div>
</div>
