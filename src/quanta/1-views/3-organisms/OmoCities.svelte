<script>
  import OmoCity from "./../2-molecules/OmoCity.svelte";
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  export let db;
  let cities = db.cities;
  export let omoheader = {
    title: "cities",
    subtitle: "about the city campaign"
  };
</script>

<div class="primary flex justify-center pt-20 pb-40">
  <div class="w-5/6 xl:w-4/6">
    <OmoHeader {omoheader} />
    <div class="flex content-start flex-wrap">
      {#each cities as city, i (city.id)}
        <OmoCity {city} />
      {/each}
    </div>
  </div>
</div>
