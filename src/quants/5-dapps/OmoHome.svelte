<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms";
  import OmoBanner from "./../2-molecules/OmoBanner";

  let OmoHome = {
    name: "OmoHome",
    type: "organisms",
    layout: {areas: "'full'", columns: "1fr", rows: "1fr"},
    blocks: [
      {
        type: "molecule",
        slot: "full",
        quant: "OmoBanner",
        data: {
          title: "follow your dreams",
          image: "/images/inspire.jpg",
          action: "javascript:navigate('omoauth')",
          button: "Start dreaming"
        }
      }
    ]
  };
</script>

<OmoOrganisms organisms={OmoHome}/>
