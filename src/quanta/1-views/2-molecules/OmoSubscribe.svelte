<script>
  export let omosubscribe = {
    title: "Get Our Updates",
    subline: "Find out about events and other news",
    email: "john@mail.com",
    image: "https://source.unsplash.com/random",
    button: "Subscribe"
  };
</script>

<div
  class="bg-cover bg-center h-auto text-white py-40 px-16 object-fill"
  style="background-image: url({omosubscribe.image})">
  <div class="p-10 py-20 flex flex-col flex-wrap justify-center content-center">
    <div
      class="m-0 p-0 text-5xl font-title uppercase text-white antialiased
      text-center">
      {omosubscribe.title}
    </div>
    <div
      class=" m-0 p-0 text-2xl text-white italic font-light font-sans
      antialiased text-center">
      {omosubscribe.subline}
    </div>
    <div class=" mt-3 flex flex-row flex-wrap">
      <input
        type="text"
        class="text-lg text-gray-600 w-2/3 px-6 rounded-l-lg"
        placeholder={omosubscribe.email} />
      <button
        class="py-3 px-4 w-1/3 bg-green-400 font-bold text-lg rounded-r-lg
        text-white hover:bg-blue-800"
        type="button">
        {omosubscribe.button}
      </button>
    </div>
  </div>
</div>
