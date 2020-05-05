<script>
  import OmoBox from "./OmoBox.svelte";
  const box = {
    styles: {
      display: "grid",
      gridColumnGap: ["space.2", "space.4"],
      gridRowGap: ["space.2", "space.4"]
    }
  };
</script>

<OmoBox {...box.styles} {...$$props}>
  <slot />
</OmoBox>
