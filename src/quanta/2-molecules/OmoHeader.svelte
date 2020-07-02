<script>
  import OmoFonts from "./../1-atoms/OmoFonts";
  export let quant = {
    data: {
      title: "Header Title",
      subline: "header subline description",
      illustration: "/images/through_the_park.svg"
    },
    design: {
      layout: "py-20 bg-gray-100",
      title: "text-gray-800 omo-font-title",
      subline: "text-gray-500 italic font-light font-sans tracking-wide",
      illustration: "w-1/2"
    }
  };
</script>

<style>
  .omo-font-title {
    font-family: OstrichSansHeavy;
  }
</style>

<div
  class="m-auto flex flex-col justify-center text-center {quant.design.layout}">
  <h2 class="flex-wrap uppercase text-4xl text-gray-800 omo-font-title">
    {quant.data.title}
  </h2>
  {#if quant.data.subline}
    <div class="flex-wrap text-2xl {quant.design.subline}">
      {quant.data.subline}
    </div>
  {/if}
  {#if quant.data.illustration}
    <div class="mt-16 mb-10 m-auto {quant.design.illustration}">
      <img src={quant.data.illustration} alt={quant.data.title} />
    </div>
  {/if}
</div>
