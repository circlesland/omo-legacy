<script>
  import OmoEnkel from "./Omo-Enkel.svelte";
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
      Unsere Enkel
    </h2>
    <div class="text-2xl text-gray-600 text-center mb-16">
      <p style="font-family: 'Indie Flower'!important;">
        "und deren authentische Erfahrungen und Erlebnisse"
      </p>
    </div>
    <div class="flex content-start flex-wrap">
      {#each enkels as enkel, i (enkel.id)}
        <OmoEnkel {enkel} />
      {/each}
    </div>
  </div>
</div>
