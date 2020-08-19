<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms";
  import {welcome} from "./../3-organisms/welcome";

  let MamaOmo = {
    name: "MamaOmo",
    type: "organisms",
    layout: {areas: "'full'", columns: "1fr", rows: "1fr"},
    blocks: [welcome]
  };
</script>

<OmoOrganisms organisms={MamaOmo}/>
