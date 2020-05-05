<script>
  import OmoHeading from "./../1-atoms/OmoHeading.svelte";
  import OmoInvertableBox from "./../2-molecules/OmoInvertableBox.svelte";
  import OmoThemeEditor from "./../2-molecules/OmoThemeEditor.svelte";

  const heading = {
    data: {
      text: "I am a heading"
    },
    design: {
      color: "color.white",
      bg: [
        "color.gray.200",
        "color.gray.400",
        "color.gray.600",
        "color.gray.800"
      ],
      px: ["space.2", "space.4", "space.6", "space.10"],
      py: ["space.1", "space.2", "space.3", "space.6"],
      textAlign: ["center", "left"]
    }
  };
  const editor = {
    design: {
      p: ["space.2", "space.4", "space.8", "space.10", "space.16"]
    }
  };
</script>

<main class="w-full overflow-y-scroll">
  <OmoHeading {...heading.design}>{heading.data.text}</OmoHeading>
  <OmoInvertableBox />
  <OmoThemeEditor {...editor.design} />
</main>
