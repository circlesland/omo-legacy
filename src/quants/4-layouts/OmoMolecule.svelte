<script>
  export var transfer;
  var block = JSON.parse(transfer);
</script>

<div
        style="grid-area: {block.slot}; display: grid; grid-template-columns:
  'minmax(1fr)'; grid-template-rows: 'minmax(1fr)'; overflow: hidden;">
  <svelte:component
          this={window.registrar.get(block.quant)}
          data={block.data}/>
</div>
