<script>
  import OmoListItem from "./../1-atoms/OmoListItem.svelte";
  let quanta = [];
  graphql("{Quants {ID name icon }}").then(result => {
    quanta = result.data.Quants;
  });

  subscribe("subscription {Quants {ID name icon collectionName}}").then(
    subscription => {
      (async () => {
        for await (let value of subscription) {
          quanta = value.data.Quants;
        }
      })();
    }
  );
</script>

<div class="p-4">
  {#each quanta as quant}
    <OmoListItem {quant} />
  {/each}
</div>
