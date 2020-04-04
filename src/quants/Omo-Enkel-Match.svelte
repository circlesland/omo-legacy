<script>
  export let enkel;
  export let db;
  let leidenschaften = db.leidenschaften.filter(x =>
    enkel.leidenschaften.some(y => x.id == y)
  );
</script>

<div class="w-1/3 p-2">
  <a href="enkel?id={enkel.id}">
    <div class="primary omo-border overflow-hidden omo-shadow">
      <img
        src={enkel.image}
        class="primary h-64 w-full rounded-t-lg object-cover object-center"
        alt="image" />
      <div class="px-6 pt-4 pb-3">
        {#each leidenschaften as leidenschaft}
          <a
            href="leidenschaft?id={leidenschaft.id}"
            class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
            font-semibold text-gray-700 mr-2 mb-2">
            #{leidenschaft.tag}
          </a>
        {/each}
      </div>
    </div>
  </a>
</div>
