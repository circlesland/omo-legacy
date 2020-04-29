<script>
  export let quant = {
    title: "title",
    subline: "subline",
    illustration: "/images/the_world_is_mine.svg"
  };
</script>

<div class="flex flex-col text-center mx-auto mb-12">
  <div class="w-1/5 mx-auto mb-10">
    <img src={quant.illustration} alt={quant.title} />
  </div>
  <div class="mx-auto text-center">
    <h1
      class="uppercase text-5xl text-blue-900 font-bold font-title leading-none
      tracking-tight mb-2">
      {quant.title}
    </h1>
    <div
      class="text-3xl text-gray-600 font-sans italic font-light tracking-wide
      mb-6">
      {quant.subline}
    </div>
  </div>

</div>
