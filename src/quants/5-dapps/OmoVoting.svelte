<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms.svelte";

  let OmoVoting = {
    name: "OmoGridVoting",
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
        quant: "OmoGridVoting",
        data: {}
      }
    ]
  };
</script>

<OmoOrganisms organisms={OmoVoting}/>
