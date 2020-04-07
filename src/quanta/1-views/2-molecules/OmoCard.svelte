<script>
  export let city;
</script>

<div class="w-1/4 p-2">
  <a href="city?id={city.id}">
    <div class="primary omo-border overflow-hidden omo-shadow">
      <img
        src={city.image}
        class="primary h-64 w-full rounded-t-lg object-cover object-center"
        alt="image" />
      <div
        class="w-full px-4 py-2 text-center hover:bg-green-400 bg-blue-800
        text-white">
        <a
          href="city?id={city.id}"
          class="text-2xl font-semibold"
          style="font-family: 'Permanent Marker', cursive !important;">
          {city.name}
        </a>
      </div>
    </div>
  </a>
</div>
