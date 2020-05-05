<script>
  import OmoBox from "./OmoBox.svelte";
  export let value = "";
  export let label = "";

  let box = {
    styles: {
      display: "grid"
    }
  };
</script>

<OmoBox {...box.styles}>
  <label>{label}</label>
  <input type="text" bind:value />
</OmoBox>
