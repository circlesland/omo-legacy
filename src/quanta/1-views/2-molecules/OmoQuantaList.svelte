<script>
  import OmoQuantaItem from "./OmoQuantaItem.svelte";
  import OmoQuanta from "./../../4-data/OmoQuanta.js";
</script>

{#each $OmoQuanta as item}
  <OmoQuantaItem model={item.model} data={item.data} design={item.design} />
{/each}
