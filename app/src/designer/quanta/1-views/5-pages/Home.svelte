<script>
  import quanta from "./../../4-data/quanta.js";
</script>

<style>
  .bg-image {
    background: url("/images/grid.png");
    background-size: repeat;
    background-position: center;
  }
</style>

<div class="bg-image p-10">
  {#each $quanta as quant}
    <div class="pb-10">
      <svelte:component this={quant.component} {quant} />
    </div>
  {/each}
</div>
