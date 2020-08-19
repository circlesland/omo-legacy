<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms.svelte";

  let OmoDapps = {
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
        quant: "ActionsList",
        data: {}
      }
    ]
  };
</script>

<OmoOrganisms organisms={OmoDapps}/>
