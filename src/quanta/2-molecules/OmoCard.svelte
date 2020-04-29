<script>
  export let quant = {
    id: "",
    name: "Contributor",
    passion:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem sequi illum facere recusandae voluptatibus"
  };
</script>

<div class="flex flex-col bg-white max-w-sm mx-auto rounded shadow">
  <div class="bg-grray-100 rounded">
    <img
      class="h-56 w-full object-cover"
      src="https://api.adorable.io/avatars/285/{quant.id}"
      alt="image" />
    <div class="px-4 py-2">
      <h1 class="text-center text-blue-900 text-lg uppercase">{quant.name}</h1>
      {#if quant.passion}
        <p class="text-gray-600 text-sm mt-1">{quant.passion}</p>
      {/if}
    </div>

  </div>
</div>
