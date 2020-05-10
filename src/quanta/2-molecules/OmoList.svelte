<script>
  import OmoListItem from "./../1-atoms/OmoListItem.svelte";
  let quanta = [];
  let addbutton = {
    name: "Add new type",
    icon: "fa-plus",
    iconColor: "text-green-400"
  };
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
  <OmoListItem quant={addbutton} />
</div>
