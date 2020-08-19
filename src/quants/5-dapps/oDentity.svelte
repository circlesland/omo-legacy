<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms";

  let OmoChat = {
    name: "OmoChat",
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
        quant: "OmoProfile",
        data: {}
      }
    ]
  };
</script>

<OmoOrganisms organisms={OmoChat}/>
