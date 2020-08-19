<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms.svelte";

  let def = {
    name: "OmoDream",
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
        quant: "OmoDappsGrid",
        data: {}
      }
    ]
  };
</script>

<OmoOrganisms organisms={def}/>
