<script>
  import OmoCard from "./../2-molecules/OmoCard.svelte";
  import cities from "./../../4-data/cities.js";

  export let currentId;
  let city = $cities.find(item => item.id == currentId);
</script>

<div class="">
  <img
    src={city.image}
    alt={city.name}
    class="w-full object-cover object-center"
    style="height: 30rem" />
</div>

<div
  class="text-4xl text-center px-4 py-12 text-gray-200 bg-blue-800 flex
  flex-wrap justify-center content-center">
  <p class="font-title uppercase font-bold">{city.name}</p>
</div>
