<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms.svelte";

  let OmoPreOrder = {
    name: "OmoGridPreOrder",
    type: "organisms",
    layout: {
      areas: "'main'",
      columns: "1fr",
      rows: "1fr"
    },
    blocks: [
      {
        type: "molecule",
        slot: "main",
        quant: "OmoGridPreOrder",
        data: {}
      }
    ]
  };
</script>

<OmoOrganisms organisms={OmoPreOrder}/>
