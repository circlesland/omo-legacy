<script>
  export let quant = {
    data: {
      uptitle: "Uptitle",
      title: "Title",
      subtitle: "subtitle",
      image: "https://source.unsplash.com/random",
      button: "call to action"
    }
  };
</script>

<div
  class="bg-cover bg-center rounded h-auto text-white py-24 px-16 object-fill"
  style="background-image: url({quant.data.image})">
  <div class="md:w-1/2">
    <p class="font-bold text-sm uppercase">{quant.data.uptitle}</p>
    <p class="text-3xl font-bold">{quant.data.title}</p>
    <p class="text-2xl mb-10 leading-none">{quant.data.subtitle}</p>
    <a
      href="/"
      class="bg-green-400 py-3 px-6 text-white font-bold uppercase text-xs
      rounded hover:bg-blue-800 hover:text-white">
      {quant.data.button}
    </a>
  </div>
</div>
