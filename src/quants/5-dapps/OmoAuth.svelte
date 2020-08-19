<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms";

  let OmoAuth = {
    name: "OmoAuth",
    type: "organisms",
    layout: {areas: "'full'", columns: "1fr", rows: "1fr"},
    blocks: [
      {
        type: "molecule",
        slot: "full",
        quant: "OmoLogin",
        data: {
          welcome: "Welcome. Omo Sapiens.",
          image: "/images/jump.jpg",
          magiclink: "magic login link has been send to your mail account",
          button: "send login link"
        }
      }
    ]
  };
</script>

<OmoOrganisms organisms={OmoAuth}/>
