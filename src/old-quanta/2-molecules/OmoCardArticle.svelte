<script>
  export let quant = {
    model: {
      name: "",
      image: "",
      author: "",
      type: ""
    },
    design: {
      layout: ""
    },
    data: {
      id: "",
      tag: "",
      excerpt: "",
      image: "",
      author: "",
      date: ""
    }
  };
</script>

<div class="flex flex-col px-8 py-6 max-w-md mx-auto {quant.design.layout}">
  <div class="flex justify-center items-center">
    <a class="px-2 py-1 bg-gray-600 text-sm text-green-100 rounded" href="/">
      {quant.data.tag}
    </a>
  </div>
  <div class="mt-4">
    <a class="text-lg text-gray-700 font-medium" href="/">
      {quant.data.excerpt}
    </a>
  </div>
  <div class="flex justify-between items-center mt-4">
    <div class="flex items-center">
      <img
        src={quant.data.image}
        class="w-8 h-8 object-cover rounded"
        alt="avatar" />
      <a class="text-gray-700 text-sm mx-3" href="/">{quant.data.author}</a>
    </div>
    <span class="font-light text-sm text-gray-600">{quant.data.date}</span>
  </div>
</div>
