<script>
  import OmoQuantPreview from "./OmoQuantPreview.svelte";
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

<div class="my-3 mx-3 flex flex-col bg-white max-w-sm rounded shadow-md">
  <!-- <OmoQuantPreview /> -->
  <!-- <div class="w-100 bg-green-300 overflow-hidden h-48 overflow-y-scroll">
    <div class="preview">
      <svelte:component this={model.component} {model} {data} {design} />
    </div>
  </div> -->
  <div class="py-2 px-3">
    <a class="text-lg text-gray-700 font-medium" href="/">{model.name}</a>
    <div class="flex justify-between items-center mt-2">
      <div class="flex items-center">
        <img
          src={model.image}
          class="w-8 h-8 object-cover rounded-full"
          alt="avatar" />
        <a class="text-gray-700 text-sm mx-3" href="/">
          {model.author}
          <br />
          <span class="font-light text-xs text-gray-500">{model.type}</span>
        </a>
      </div>
    </div>
  </div>
</div>
