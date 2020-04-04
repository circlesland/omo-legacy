<script>
  import OmoCity from "./Omo-City.svelte";
  export let db;
  export let currentId;
  let cities = db.cities;
</script>

<div class="flex justify-center my-20">
  <div class="w-5/6 xl:w-4/6">
    <img src="/images/divider-1.png" alt="divider" class="px-48 mt-8" />
    <h2
      class="text-center text-5xl text-ci mt-10 mb-6"
      style="font-family: 'Indie Flower'!important;">
      Unsere Städte
    </h2>
    <div class="text-2xl text-gray-600 text-center mb-16">
      <p style="font-family: 'Indie Flower'!important;">
        "erforsche in jeder Stadt die Lebensträume in deiner direkten Umgebung"
      </p>
    </div>
    <div class="flex content-start flex-wrap">
      {#each cities as city, i (city.id)}
        <OmoCity {city} />
      {/each}
    </div>
  </div>
</div>
