<script>
  export let data = {
    bundleId: ""
  };

</script>

<div class="h-full flex flex-col justify-center">
  <div class="text-center">
    Trust another Omo Sapiens
  </div>
</div>

<div class="flex">
  <input
          class="w-full p-3 border-t mr-0 border-b border-l text-gray-800
        border-gray-200 bg-white"
          placeholder="Safe address"/>
  <button
          on:click="{() => submit()}"
          class="px-6 bg-green-400 text-gray-800 font-bold p-3 uppercase ">
    Next
  </button>
</div>
