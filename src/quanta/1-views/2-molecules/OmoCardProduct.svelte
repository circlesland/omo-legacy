<script>
  export let omocardproduct = {
    name: "NIKE AIR",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem sequi illum facere recusandae voluptatibus",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    price: "129€",
    button: "Add to Card"
  };
</script>

<div class="flex flex-col bg-white max-w-sm mx-auto rounded-lg shadow-lg">
  <div class="bg-white shadow-lg rounded-lg">
    <div class="px-4 py-2">
      <h1 class="text-gray-900 font-bold text-3xl uppercase">
        {omocardproduct.name}
      </h1>
      <p class="text-gray-600 text-sm mt-1">{omocardproduct.description}</p>
    </div>
    <img
      class="h-56 w-full object-cover mt-2"
      src={omocardproduct.image}
      alt="NIKE AIR" />
    <div class="flex items-center justify-between px-4 py-2 bg-gray-900">
      <h1 class="text-gray-200 font-bold text-xl">{omocardproduct.price}</h1>
      <button
        class="px-3 py-1 bg-green-400 text-sm text-white hover:bg-blue-800
        font-semibold rounded">
        {omocardproduct.button}
      </button>
    </div>
  </div>
</div>
