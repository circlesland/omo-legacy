<script>
  export let quant = {
    title: "title",
    subline: "subline",
    illustration: "/images/the_world_is_mine.svg"
  };
</script>

<div class="flex flex-col text-center mx-auto my-6">
  {#if quant.illustration}
    <div class="w-1/5 mx-auto mb-10">
      <img src={quant.illustration} alt={quant.title} />
    </div>
  {/if}
  <div class="mx-auto text-center">
    <h1
      class="uppercase text-4xl text-blue-900 font-bold leading-none
      tracking-tight mb-2">
      {quant.title}
    </h1>
    {#if quant.subline}
      <div
        class="text-xl text-gray-600 font-sans italic font-light tracking-wide
        mb-6">
        {quant.subline}
      </div>
    {/if}
  </div>

</div>
