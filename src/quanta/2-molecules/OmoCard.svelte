<script>
  export let quant = {
    id: "",
    name: "name",
    image: "image",
    passion: ""
  };
</script>

<div class="flex flex-col bg-white max-w-sm mx-auto rounded shadow">
  <div class="bg-grray-100 rounded">
    <img class="h-auto w-full object-cover" src={quant.image} alt="image" />
    <div class="px-4 py-2">
      <h1 class="text-center text-blue-900 text-sm font-bold uppercase">
        {quant.name}
      </h1>
      {#if quant.passion}
        <p class="text-gray-600 text-sm mt-1">{quant.passion}</p>
      {/if}
    </div>
  </div>
</div>
