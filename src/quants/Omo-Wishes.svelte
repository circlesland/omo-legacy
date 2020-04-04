<script>
  import OmoWish from "./Omo-Wish.svelte";
  export let db;
  export let currentId;
  export let wishes;
  if (!wishes) wishes = db.wishes;
</script>

<div>
  <img src="/images/divider-1.png" alt="divider" class="px-48 mt-8" />
  <div class="text-2xl text-gray-600 text-center mt-6 mb-8">
    Meine kleinen Freuden des Tages
  </div>
  <div class="flex content-start flex-wrap">
    {#each wishes as wish, i (wishes.id)}
      <OmoWish {wish} />
    {/each}
  </div>
</div>
