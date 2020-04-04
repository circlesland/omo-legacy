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
        class="w-full px-4 pt-1 pb-1 text-center hover:bg-orange-300
        hover:text-gray-800 bg-ci text-gray-100">
        <a
          href="#city"
          class="text-lg font-semibold"
          style="font-family: 'Indie Flower'!important;">
          {city.name}
        </a>
      </div>
    </div>
  </a>
</div>
