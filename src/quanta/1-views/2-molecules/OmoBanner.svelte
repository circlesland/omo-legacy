<script>
  export let omobanner = {
    uptitle: "Uptitle",
    title: "Title",
    subtitle: "subtitle",
    image: "https://source.unsplash.com/random",
    button: "call to action"
  };
</script>

<div
  class="bg-cover bg-center h-auto text-white py-24 px-16 object-fill"
  style="background-image: url({omobanner.image})">
  <div class="md:w-1/2">
    <p class="font-bold text-sm uppercase">{omobanner.uptitle}</p>
    <p class="text-3xl font-bold">{omobanner.title}</p>
    <p class="text-2xl mb-10 leading-none">{omobanner.subtitle}</p>
    <a
      href="#"
      class="bg-green-400 py-3 px-6 text-white font-bold uppercase text-xs
      rounded hover:bg-blue-800 hover:text-white">
      {omobanner.button}
    </a>
  </div>
</div>
