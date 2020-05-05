<script>
  export let quant = {
    data: {
      title: "Get Our Updates",
      subline: "Find out about events and other news",
      email: "team@omo.earth",
      image: "https://source.unsplash.com/random",
      button: "Subscribe On Github"
    }
  };
</script>

<div
  class="bg-cover bg-center h-auto text-white py-24 px-16 object-fill"
  style="background-image: url({quant.data.image})">
  <div class="p-10 py-20 flex flex-col flex-wrap justify-center content-center">
    <div
      class="m-0 p-0 text-5xl font-title font-bold uppercase text-white
      antialiased text-center">
      {quant.data.title}
    </div>
    <div
      class=" m-0 p-0 text-2xl text-white italic font-light font-sans
      antialiased text-center">
      {quant.data.subline}
    </div>
    <div class=" mt-3 flex flex-row flex-wrap">
      <input
        type="text"
        class="text-lg text-gray-600 w-2/3 px-6 rounded"
        placeholder={quant.data.email} />
      <button
        class="py-3 px-4 w-1/3 bg-green-400 font-bold text-lg rounded text-white
        hover:bg-blue-800"
        type="button">
        {quant.data.button}
      </button>
    </div>
  </div>
</div>
