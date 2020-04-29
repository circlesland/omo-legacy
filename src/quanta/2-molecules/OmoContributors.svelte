<script>
  import OmoCard from "./OmoCard.svelte";
  const contributors = [
    {
      id: "1",
      name: "Philipp Bartels",
      image: "/images/philipp.jpg"
    },
    {
      id: "2",
      name: "Samuel Andert",
      image: "/images/samuel.jpg"
    }
  ];
</script>

<div class="py-4 grid grid-cols-3 gap-3 lg:grid-cols-6 lg:gap-6">
  {#each contributors as quant, i (quant.id)}
    <OmoCard {quant} />
  {/each}
</div>
