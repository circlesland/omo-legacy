<script>
  import OmoQuantPreview from "./OmoQuantPreview.svelte";
  export let quant;
</script>

<div class="bg-white max-w-sm rounded shadow-md border">
  <OmoQuantPreview {quant} />
  <div class="py-2 px-3 bg-gray-100">
    <a
      class="text-md font-semibold text-gray-700 font-medium "
      href="/quant?id={quant.id}">
      {quant.model.name}
    </a>
  </div>
  <div class="pb-2 px-3 flex justify-between items-center mt-2">
    <div class="flex items-center">
      <img
        src={quant.model.image}
        class="w-10 h-10 object-cover rounded"
        alt="avatar" />
      <a class="text-gray-700 text-sm mx-3" href="/quant?id={quant.id}">
        {quant.model.author}
        <br />
        <span class="font-light text-xs text-gray-500">
          {quant.model.group}-{quant.model.type}s-{quant.model.tags}s
        </span>
      </a>
    </div>
  </div>
</div>
