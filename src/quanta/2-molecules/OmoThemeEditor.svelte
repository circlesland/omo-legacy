<script>
  import OmoBox from "./../1-atoms/OmoBox.svelte";
  import OmoHeading from "./../1-atoms/OmoHeading.svelte";
  import OmoTextInput from "./../1-atoms/OmoTextInput.svelte";
  import OmoGrid from "./../1-atoms/OmoGrid.svelte";
  import theme from "./../1-atoms/theme.js";

  let box = {
    styles: {
      bg: "color.gray.200",
      p: "space.6"
    }
  };
  let heading = {
    styles: {
      mb: "space.2"
    }
  };
  let grid = {
    styles: {
      gridTemplateColumns: ["repeat(1,1fr)", "repeat(2,1fr)", "repeat(3,1fr)"]
    }
  };
</script>

<OmoBox {...box.styles} {...$$props}>
  <OmoHeading {...heading.styles}>Colors:</OmoHeading>
  <OmoGrid {...grid.styles}>
    <OmoTextInput label="primary" bind:value={$theme.color.primary} />
    <OmoTextInput label="secondary" bind:value={$theme.color.secondary} />
    <OmoTextInput label="lightgrey" bind:value={$theme.color.lightgrey} />
  </OmoGrid>
</OmoBox>
