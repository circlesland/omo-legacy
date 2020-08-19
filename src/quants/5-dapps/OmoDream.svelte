<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms";


  var design = {bg: "bg-primary", text: "bg-primary"};

  let OmoDream = {
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
        quant: "OmoDream",
        data: {design}
      }
    ]
  };
</script>

<OmoOrganisms organisms={OmoDream}/>
