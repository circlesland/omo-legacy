<script>
  export let quant;
</script>

<style>
  .preview {
    transform: scale(0.2);
    height: 20px;
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-right: -50vw;
    margin-left: -50vw;
  }
  .bg-image {
    background: url("/images/grid.png");
    background-size: cover;
    background-position: center;
  }
</style>

<div
  class="w-100 bg-green-200 overflow-hidden h-48 overflow-y-scroll object-center
  object-cover border border-gray-300 bg-image">
  <div class="preview">
    <svelte:component this={quant.component} {quant} />
  </div>
</div>
