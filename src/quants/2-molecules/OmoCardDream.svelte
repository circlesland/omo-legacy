<script>
  import { Omosapiens } from "../../queries/omo/odentity/omosapiens";

  export let data = {};

  async function lookupName(omosapienId) {
    const omosapien = await Omosapiens.byId(omosapienId);
    if (!omosapien || omosapien.length === 0) return omosapienId;
    else return omosapien.name;
  }
</script>

<div
  class="bg-white relative shadow text-gray-800 hover:shadow-lg rounded-lg
  overflow-hidden">
  <span
    class="font-title w-full text-center text-sm font-bold inline-block p-2
    uppercase text-white bg-leap3">
    14 / 143
  </span>
  <div class="relative">
    <div class="overflow-hidden h-3 text-xs flex bg-dark">
      <div
        style="width: 50%"
        class="shadow-none flex flex-col text-center whitespace-nowrap
        text-white justify-center bg-tertiary" />
    </div>
  </div>
  <div class="z-0 relative group h-48 w-full flex justify-center items-center">
    <div
      class="h-full w-full absolute bg-cover z-10 bg-center "
      style="background-image: url('https://source.unsplash.com/featured/?{data.city},city')" />
    <p
      class="w-full h-full bg-primary opacity-50 text-center pt-8 font-bold
      text-3xl text-white absolute z-20 pointer-events-none uppercase">
      {data.city}
    </p>
  </div>
  <div class="flex justify-center z-30">

    <img
      src="https://i.pravatar.cc/150?u={data.creatorId}"
      class="z-30 rounded-full -mt-20 border-8 object-center object-cover
      border-white mr-2 h-36 w-36"
      alt="" />

  </div>
  <div class="p-4 h-40">
    <div class="font-bold font-title text-xl text-center">
      {#await lookupName(data.creatorId)}
        Loading Omosapien ..
      {:then name}
        {name}
      {/await}
    </div>
    <p class="text-center text-gray-600 uppercase">{data.name}</p>
    <div class="text-sm font-light text-center py-1 px-4">
      {data.description}
    </div>
  </div>

  <div class="h-10 flex items-center justify-between bg-gray-100">
    <a
      href="javascript:navigate('omodream', '{data._id}')"
      class="w-full text-center text-white bg-tertiary font-bold text-lg px-4
      py-2 uppercase hover:bg-secondary">
      join dream
    </a>
  </div>

</div>
