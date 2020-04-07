<script>
  import OmoEnkel from "../../../quants/Omo-Enkel.svelte";
  import OmoCity from "../../../quants/Omo-City.svelte";
  import OmoLeidenschaften from "../../../quants/OmoLeidenschaften.svelte";
  export let db;
  export let currentId;
  let enkel = db.enkels.find(item => item.id == currentId);
  let city = db.cities.find(item => item.id == enkel.city);
  let leidenschaften = db.leidenschaften.filter(x =>
    enkel.leidenschaften.some(y => y == x.id)
  );
</script>

<div
  class="py-64 text-4xl text-gray-700 w-full flex content-center flex-wrap
  bg-cover bg-center justify-center overflow-hidden"
  style="background-image: url('{enkel.image}')"
  title="dream" />

<div
  class="text-3xl text-center px-4 py-16 text-white bg-blue-800 flex flex-wrap
  justify-center content-center">
  <div style="font-family: 'Permanent Marker', cursive !important">
    {enkel.story}
  </div>
</div>

<div class="flex justify-center my-10">
  <div class="w-5/6 xl:w-4/6">
    <img src="/images/divider-1.png" alt="divider" class="px-48 mt-8" />
    <h2
      class="text-center text-5xl text-green-400 mt-10 mb-6"
      style=" font-family: 'Permanent Marker', cursive !important;">
      Meine schöne Heimatstadt
    </h2>
    <div class="flex justify-center">
      <OmoCity {city} {db} />
    </div>
  </div>
</div>

<div class="flex justify-center my-10">
  <OmoLeidenschaften {leidenschaften} />
</div>
