<script>
  import OmoFonts from "./../1-atoms/OmoFonts";
  export let quant = {
    uptitle: "uptitle",
    title: "title",
    subline: "subline",
    illustration: "/images/the_world_is_mine.svg"
  };
</script>

<div class="flex flex-col text-center mx-auto my-6">
  {#if quant.illustration}
    <div class="w-1/3 mx-auto mb-10">
      <img src={quant.illustration} alt={quant.title} />
    </div>
  {/if}
  <div class="mx-auto text-center">
    <p class="text-gray-500 text-s uppercase py-4 text-green-400 font-bold">
      {quant.uptitle}
    </p>
    <h1
      class="uppercase text-4xl text-blue-900 mb-1"
      style="font-family: 'Montserrat', sans-serif !important;">
      {quant.title}
    </h1>
    {#if quant.subline}
      <div
        class="text-xl text-gray-600 italic font-light tracking-wide mb-6 py-4">
        {quant.subline}
      </div>
    {/if}
  </div>

</div>
