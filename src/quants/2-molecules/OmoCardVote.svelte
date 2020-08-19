<script>
  export let data = {};
</script>

<div class="max-w-sm bg-white shadow-lg rounded-lg overflow-hidden my-4">
  <span
    class="font-title w-full text-center text-sm font-bold inline-block p-2
    uppercase text-white bg-leap2">
    {data.follower} / 143
  </span>
  <div class="relative">
    <div class="overflow-hidden h-3 text-xs flex bg-dark">
      <div
        style="width: {(data.follower * 100) / 143}%"
        class="shadow-none flex flex-col text-center whitespace-nowrap
        text-white justify-center bg-tertiary" />
    </div>
  </div>
  <img
    class="w-full h-56 object-cover object-center"
    src={data.image}
    alt={data.name} />
  <!-- <div class="w-full flex items-center px-6 py-3 bg-dark">
    <div
      class="w-full flex justify-between font-title text-white font-semibold
      text-lg">
      <span>my dream</span>
    </div>
  </div> -->
  <div class="py-4 px-6">
    <h1 class="uppercase text-lg font-semibold text-primary">{data.name}</h1>
    <p class="py-2 text-gray-700 h-32">{data.description}</p>
  </div>
  <div class="font-title flex justify-between w-full">
    <a
      href="javascript:navigate('omodream')"
      class="w-full text-center text-white bg-tertiary font-bold text-lg px-4
      py-2 uppercase hover:bg-secondary">
      vote to fund
    </a>
  </div>
</div>

<!-- 
<section class="border border-gray-100">
  <span
    class="font-title w-full text-center text-sm font-bold inline-block p-2
    uppercase text-white bg-leap3">
    {data.follower} / 1596
  </span>
  <div class="relative">
    <div class="overflow-hidden h-3 text-xs flex bg-gray-400">
      <div
        style="width: {(data.follower * 100) / 1596}%"
        class="shadow-none flex flex-col text-center whitespace-nowrap
        text-white justify-center bg-tertiary" />
    </div>
  </div>

  <img class="h-56 w-full object-cover" src={data.image} alt={data.name} />
  <div class="bg-gray-100 px-4 py-2">
    <h1 class="text-gray-900 font-bold text-3xl uppercase text-primary">
      {data.name}
    </h1>
    <p class="text-gray-600 text-sm mt-1">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi quos quidem
      sequi illum facere recusandae voluptatibus
    </p>
  </div>
  <div class="font-title flex justify-between bg-leap3">
    <div class="px-4 py-2 text-white font-bold text-lg">
      Ø{data.price} / week
    </div>
    <a
      href="javascript:navigate('omodream')"
      class="text-center text-white bg-tertiary font-bold text-lg px-4 py-2
      uppercase hover:bg-secondary">
      pre-order now
    </a>
  </div>
</section> -->
