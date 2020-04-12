<script>
  import OmoCard from "./../2-molecules/OmoCard.svelte";
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  export let db;
  let cities = db.cities;
  export let omoheader = {
    title: "Die Städte Kampagne",
    subline: "so funktiniert sie im detail"
  };
</script>

<OmoHeader {omoheader} />

<div class="flex justify-center my-10 pb-20">
  <div class="w-5/6 xl:w-4/6">
    <div class="flex">
      {#each cities as city}
        <OmoCard {city} {db} />
      {/each}
    </div>
  </div>
</div>
