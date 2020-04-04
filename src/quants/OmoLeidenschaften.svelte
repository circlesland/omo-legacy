<script>
  import OmoWishes from "../quants/Omo-Wishes.svelte";
  export let db;
  export let leidenschaften;
  export let currentId;
  if (!leidenschaften) leidenschaften = db.leidenschaften;
</script>

<div class="w-1/2 p-2">
  <div class="flex flex-col bg-white px-8 py-6 rounded-lg shadow-lg">
    <div class="flex justify-center items-center">
      <a
        class="p-3 py-1 bg-gray-600 text-sm text-green-100 rounded-full"
        href="#">
        Was mir Freude bereitet
      </a>
    </div>
    <div class="mt-4 text-center">
      <div class="px-6 pt-2 pb-2">
        {#each leidenschaften as leidenschaft, i (leidenschaft.id)}
          <a
            href="leidenschaft?id={leidenschaft.id}"
            class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
            font-semibold text-gray-700 mr-2 mb-2">
            #{leidenschaft.tag}
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>
