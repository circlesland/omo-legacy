<script>
  import OmoEnkel from "./Omo-Enkel-Match.svelte";
  export let db;
  export let enkels;
  if (!enkels) enkels = db.enkels;
</script>

<div class="flex justify-center my-20">
  <div class="w-5/6 xl:w-4/6">
    <img src="/images/divider-1.png" alt="divider" class="px-48 mt-8" />
    <h2
      class="text-center text-5xl text-ci mt-10 mb-6"
      style="font-family: 'Indie Flower'!important;">
      Enkel
    </h2>
    <div class="flex content-start flex-wrap">
      {#each enkels as enkel, i (enkel.id)}
        <OmoEnkel {enkel} {db} />
      {/each}
    </div>
  </div>
</div>
