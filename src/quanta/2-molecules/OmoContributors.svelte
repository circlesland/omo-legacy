<script>
  import OmoCard from "./OmoCard.svelte";
  const contributors = [
    {
      id: "1",
      name: "Philipp Bartels"
    },
    {
      id: "2",
      name: "Samuel Andert"
    }
  ];
</script>

<div
  class="py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
  gap-6">
  {#each contributors as quant, i (quant.id)}
    <OmoCard {quant} />
  {/each}
</div>
