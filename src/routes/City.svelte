<script>
  import OmoCity from "../quants/Omo-City.svelte";
  import OmoEnkels from "../quants/Omo-Enkels.svelte";
  import OmoDreams from "../quants/Omo-Dreams.svelte";
  import OmoBlog from "../quants/Omo-Blog.svelte";
  export let db;
  export let currentId;
  let city = db.cities.find(item => item.id == currentId);
  let enkels = db.enkels.filter(item => item.city == city.id);
  let dreams = db.dreams.filter(item => item.city == city.id);
  let blog = db.blog.filter(item => item.cities.some(id => id == city.id));
</script>

<div
  class="py-64 text-6xl w-full flex content-center flex-wrap bg-cover bg-center
  justify-center overflow-hidden uppercase font-bolt text-white"
  style="background-image: url('{city.image}')"
  title={city.name}>
  {city.name}
</div>

<OmoDreams {dreams} {db} />
<OmoEnkels {enkels} {db} />
<OmoBlog {blog} {db} />
