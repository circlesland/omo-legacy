<script>
  import OmoFonts from "./../1-atoms/OmoFonts";
  export let quant = {
    title: "title",
    text: "test",
    illustration: "/illustrations/plant_the_seed.svg"
  };
</script>

<div class="my-8 py-12" style="background-color: #fafafa">

  <div class="flex justify-center mb-8">
    <img class="h-64" src={quant.illustration} alt="plant the seed" />
  </div>

  <div class="flex content-center justify-center w-full">
    <div class="text-center w-full">
      <div
        class="uppercase text-5xl text-green-400 mb-1"
        style="font-family: 'Montserrat', sans-serif !important;">
        {quant.title}
      </div>
      <div class="text-lg text-gray-600 italic font-light tracking-wide pt-6">
        {quant.text}
      </div>
    </div>
  </div>
</div>
