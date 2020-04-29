<script>
  export let city;
</script>

<div class="min-w-100">
  <a href="city?id={city.id}">
    <div class="primary omo-border overflow-hidden omo-shadow">
      <img
        src={city.image}
        class="primary h-64 w-full rounded-t-lg object-cover object-center"
        alt="image" />
      <div
        class="w-full px-4 pb-2 pt-3 text-center hover:bg-green-400 bg-blue-800
        text-white">
        <a
          href="city?id={city.id}"
          class="text-xl font-bold font-title uppercase">
          {city.name}
        </a>
      </div>
    </div>
  </a>
</div>
<p />
