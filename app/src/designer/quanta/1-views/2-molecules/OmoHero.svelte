<script>
  export let quant = {
    id: "",
    model: {
      id: "",
      name: "",
      image: "",
      author: "",
      type: ""
    },
    data: {
      id: "",
      title: "",
      subline: "",
      description: "",
      illustration: "",
      button: ""
    },
    design: {
      layout: ""
    }
  };
</script>

<div class="flex flex-col mx-auto {quant.design.layout}">
  <div class="flex flex-col-reverse sm:flex-row jusitfy-between items-center">
    <div
      class="sm:w-3/5 flex flex-col items-center sm:items-start text-center
      sm:text-left">
      <h1
        class="uppercase text-5xl text-blue-900 font-bold font-title
        leading-none tracking-tight mb-2">
        {quant.data.title}
      </h1>
      <div
        class="text-3xl text-gray-600 font-sans italic font-light tracking-wide
        mb-6">
        {quant.data.subline}
      </div>
      <p class="text-gray-500 leading-relaxed mb-12">
        {quant.data.description}
      </p>
      <a
        href="/"
        class="bg-green-400 hover:bg-blue-800 py-2 px-4 text-lg font-bold
        text-white rounded">
        {quant.data.button}
      </a>
    </div>
    <div class="lg:px-20 w-2/5">
      <img src={quant.data.illustration} alt={quant.data.title} />
    </div>
  </div>
</div>
