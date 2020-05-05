<script>
  import OmoBox from "./../1-atoms/OmoBox.svelte";
  import OmoButton from "./../1-atoms/OmoButton.svelte";
  import OmoHeading from "./../1-atoms/OmoHeading.svelte";
  let inverted = false;

  let box = {
    styles: {
      p: "space.10",
      textAlign: "center"
    }
  };
  let heading = {
    data: {
      text: "Fully reactive styles"
    },
    styles: {
      mb: "space.8"
    }
  };
  let button = {
    data: {
      text: "click me to invert colors"
    },
    styles: {
      py: "space.2",
      px: "space.4",
      borderRadius: "full"
    }
  };
</script>

<OmoBox
  color={inverted ? 'color.primary' : 'color.secondary'}
  bg={inverted ? 'color.secondary' : 'color.primary'}
  {...box.styles}
  {...$$props}>
  <OmoHeading {...heading.styles}>{heading.data.text}</OmoHeading>
  <OmoButton
    {...button.styles}
    bg={inverted ? 'color.primary' : 'color.secondary'}
    color={inverted ? 'color.secondary' : 'color.primary'}
    on:click={() => (inverted = !inverted)}>
    {button.data.text}
  </OmoButton>
</OmoBox>
