<script>
  export var transfer;
  var block = JSON.parse(transfer);
  import OmoOrganisms from "./OmoOrganisms";

  var organisms = {layout: block.layout, blocks: block.blocks};
</script>

<section
        class="organisms"
        style="--areas: {block.layout.areas}; --columns: {block.layout.columns};
  --rows: {block.layout.rows}; ">
  <OmoOrganisms {organisms}/>
</section>
