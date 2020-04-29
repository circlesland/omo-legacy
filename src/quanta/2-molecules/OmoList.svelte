<script>
  import OmoListItem from "./../1-atoms/OmoListItem.svelte";
  export let routes;
</script>

<div class="p-4">
  {#each routes.filter(x => x.name != null) as quant}
    <OmoListItem {quant} />
  {/each}
</div>
