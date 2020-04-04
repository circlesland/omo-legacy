<script>
  export let db;
  export let currentId;
  export let dream;
  if (!dream) dreams = db.dreams.find(d => d.id == currentId);
  let leidenschaften = db.leidenschaften.filter(ls =>
    dream.leidenschaften.some(x => x == ls.id)
  );
</script>

<div class="w-1/3 p-2">
  <a href="dream?id={dream.id}">
    <div class="primary omo-border overflow-hidden omo-shadow">
      <img
        src={dream.image}
        class="primary h-64 w-full rounded-t-lg object-cover object-center"
        alt="image" />
      <div
        class="text-xl text-center p-4 text-gray-200 mb-2 bg-ci-2 flex flex-wrap
        justify-center content-center h-48">
        <p style="font-family: 'Indie Flower'!important;">
          "{dream.name}'s großer Lebenstraum ist {dream.dream}"
        </p>
      </div>
      <div class="px-6 pt-2">
        <p class="text-xs text-gray-500 mb-1 uppercase">Meine Leidenschaften</p>
        {#each leidenschaften as leidenschaft}
          <a
            href="leidenschaft?id={leidenschaft.id}"
            class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
            font-semibold text-gray-700 mr-2 mb-2">
            #{leidenschaft.tag}
          </a>
        {/each}
      </div>
      <div
        class="mt-4 w-full px-4 pt-1 pb-1 text-center hover:bg-orange-300
        hover:text-gray-800 bg-ci text-gray-100">
        <a
          href="dream?id={dream.id}"
          class="text-lg font-semibold"
          style="font-family: 'Indie Flower'!important;">
          näher kennenlernen
        </a>
      </div>
    </div>
  </a>
</div>
