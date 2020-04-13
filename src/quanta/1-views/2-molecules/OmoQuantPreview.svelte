<script>
  export let model;
  export let data;
  export let design;
</script>

<style>
  .preview {
    transform: scale(0.22);
    height: 20px;
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-right: -50vw;
    margin-left: -50vw;
  }
</style>

<div class="w-100 bg-green-300 overflow-hidden h-48 overflow-y-scroll">
  <div class="preview">
    <svelte:component this={model.component} {model} {data} {design} />
  </div>
</div>
