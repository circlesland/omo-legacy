<script>
  export let data = {};
</script>

<div class="container mx-auto max-w-sm overflow-hidden shadow-lg my-2 bg-white">
  <div class="text-xs text-center bg-gray-300 text-primary">{data.type}</div>
  <div
    class="relative z-10"
    style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 5vw));">
    <div
      class="z-0 relative group h-48 w-full flex justify-center items-center">
      <div
        class="h-full w-full absolute bg-cover z-10 bg-center "
        style="background-image: url('{data.image}')" />
      <p
        class="w-full h-full bg-primary opacity-50 text-center pt-8 font-bold
        text-xl text-white absolute z-20 pointer-events-none uppercase">
        {data.city}
      </p>
    </div>
  </div>
  <div
    class="h-12 flex justify-between items-center flex-row px-6 z-50 -mt-10" />
  <div class="h-24 text-gray-600 text-center">
    <p class="text-primary text-sm">@{data.name}</p>
    <p class="text-sm p-2">{data.description}</p>
  </div>
  <div
    class="w-full text-white text-center hover:bg-primary uppercase p-2
    bg-secondary font-bold">
    Open Organisation
  </div>
</div>
