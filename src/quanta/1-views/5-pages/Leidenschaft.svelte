<script>
  import OmoDreams from "../../../quants/Omo-Dreams.svelte";
  import OmoEnkels from "../../../quants/Omo-Enkels-Match.svelte";
  export let db;
  export let leidenschaft;
  export let currentId;
  if (!leidenschaft)
    leidenschaft = db.leidenschaften.find(x => x.id == currentId);
  let dreams = db.dreams.filter(x =>
    x.leidenschaften.some(y => y == leidenschaft.id)
  );
  let enkels = db.enkels.filter(x =>
    x.leidenschaften.some(y => y == leidenschaft.id)
  );
</script>

<div
  class="text-4xl text-center px-4 py-16 text-gray-200 bg-ci-2 flex flex-wrap
  justify-center content-center">
  <p style="font-family: 'Indie Flower'!important;">{leidenschaft.tag}</p>
</div>

<div class="flex flex-wrap justify-center content-center px-6 pt-2">
  {#each db.leidenschaften as leidenschaft}
    <a
      href="leidenschaft?id={leidenschaft.id}"
      class="inline-block bg-gray-400 rounded-full px-3 py-1 text-sm
      font-semibold text-gray-700 mr-2">
      #{leidenschaft.tag}
    </a>
  {/each}
</div>

<OmoDreams {dreams} {db} />
<OmoEnkels {enkels} {db} />
