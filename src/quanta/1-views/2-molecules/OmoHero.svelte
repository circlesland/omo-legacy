<script>
  export let model = {
    name: "Omo Hero",
    image: "/images/samuel.jpg",
    author: "Samuel Andert",
    type: "omo/views/molecules"
  };
  export let design = {};
  export let data = {
    id: "",
    title: "hero title",
    subline: "hero subtitle message",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing. Vestibulum rutrum metus at enim congue scelerisque. Sed suscipit metu non iaculis semper consectetur adipiscing elit.",
    illustration: "/images/progressive_app.svg",
    button: "Call to Action"
  };
</script>

<div class="bg-white flex flex-col font-sans">

  <div class="container mx-auto py-16">
    <main
      class="flex flex-col-reverse sm:flex-row jusitfy-between items-center ">
      <div
        class="sm:w-3/5 flex flex-col items-center sm:items-start text-center
        sm:text-left">
        <h1
          class="uppercase text-5xl text-blue-900 font-bold font-title
          leading-none tracking-tight mb-2">
          {data.title}
        </h1>
        <div
          class="text-3xl text-gray-600 font-subtitle italic font-light
          tracking-wide mb-6">
          {data.subline}
        </div>
        <p class="text-gray-500 leading-relaxed mb-12">{data.description}</p>
        <a
          href="/"
          class="bg-green-400 hover:bg-blue-800 py-2 px-4 text-lg font-bold
          text-white rounded">
          {data.button}
        </a>
      </div>
      <div class="lg:px-20 w-2/5">
        <img class="" src={data.illustration} alt={data.title} />
      </div>
    </main>
  </div>
</div>
