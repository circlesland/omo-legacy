<script>
  import OmoFonts from "./../1-atoms/OmoFonts";
  export let quant = {
    uptitle: "omo earth",
    title: "one quantum leap a time",
    subline: "subline",
    image: "https://source.unsplash.com/random",
    button: "call to action",
    buttonlink: "/"
  };
</script>

<div
  class="bg-cover bg-center rounded h-auto text-white py-24 px-16 object-fill"
  style="background-image: url({quant.image})">
  <div
    class="md:w-2/3 m-auto text-center px-16 py-8 rounded"
    style="background-color: rgba(11, 42, 77, 0.8);">
    <p class="text-gray-300 text-s uppercase text-green-400 font-bold">
      {quant.uptitle}
    </p>
    <p
      class="text-5xl font-bold font-title uppercase py-2"
      style="font-family: 'Montserrat', sans-serif !important;">
      {quant.title}
    </p>
    <p class="text-xl text-gray-300 font-sans italic">{quant.subline}</p>
    {#if quant.button}
      <a
        href={quant.button.link}
        class="mt-10 bg-green-400 py-3 px-6 text-white font-bold uppercase
        text-xs rounded hover:bg-blue-800 hover:text-white">
        {quant.button}
      </a>
    {/if}
  </div>
</div>
