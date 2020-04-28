<script>
  export let quant = {
    model: {
      name: "",
      image: "",
      author: "",
      type: "",
      group: "",
      tags: ""
    },
    design: {},
    data: {
      id: "",
      name: "PRODUCT NAME",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem sequi illum facere recusandae voluptatibus",
      image: "https://source.unsplash.com/random",
      price: "129€",
      button: "Add to Card"
    }
  };
</script>

<div class="flex flex-col bg-white max-w-sm mx-auto rounded shadow-lg">
  <div class="bg-white shadow-lg rounded">
    <div class="px-4 py-2">
      <h1 class="text-blue-900 font-title font-bold text-2xl uppercase">
        {quant.data.name}
      </h1>
      <p class="text-gray-600 text-sm mt-1">{quant.data.description}</p>
      <div class="text-xs text-blue-600 font-bold ">more</div>
    </div>
    <img
      class="h-56 w-full object-cover mt-2"
      src={quant.data.image}
      alt="NIKE AIR" />
    <div
      class="flex items-center justify-between px-4 py-2 bg-gray-900 rounded-b">
      <h1 class="text-gray-200 font-bold text-xl">{quant.data.price}</h1>
      <button
        class="px-3 py-1 bg-green-400 text-sm text-white hover:bg-blue-800
        font-semibold rounded">
        {quant.data.button}
      </button>
    </div>
  </div>
</div>
