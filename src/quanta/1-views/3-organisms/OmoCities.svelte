<script>
  import OmoCard from "./../2-molecules/OmoCard.svelte";
  import cities from "./../../4-data/cities.js";
  export let currentId;
</script>

<div
  class="px-8 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
  gap-6">
  {#each $cities as city, i (city.id)}
    <OmoCard {city} {currentId} />
  {/each}
</div>
