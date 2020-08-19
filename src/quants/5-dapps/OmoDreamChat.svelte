<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms";

  let OmoDreamChat = {
    name: "OmoChat",
    type: "organisms",
    layout: {
      areas: "'main'",
      columns: "1fr",
      rows: "1fr",
    },
    blocks: [
      {
        type: "molecule",
        slot: "main",
        quant: "OmoChat",
        data: {},
      },
    ],
  };
</script>

<OmoOrganisms organisms={OmoDreamChat} />
