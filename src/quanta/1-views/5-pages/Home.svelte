<script>
  export let db;
  export let currentId;
  import OmoThemeLight from "../../../design/Omo-Theme-Light.svelte";
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoVideo from "./../2-molecules/OmoVideo.svelte";
  import OmoSteps from "./../3-organisms/OmoSteps.svelte";
  import OmoCities from "../../../quants/Omo-Cities.svelte";

  import OmoDreams from "../../../quants/Omo-Dreams.svelte";
  import OmoEnkels from "../../../quants/Omo-Enkels.svelte";

  export let dreamheader = {
    title: "Wir haben einen Traum...",
    subtitle: "{...... dass wir .......}"
  };
  export let omovideo = {
    link: "https://www.youtube.com/embed/HfzZQvoJATA"
  };
  export let omosteps = [
    {
      title: "Step 1",
      description: "description 1",
      image: "images/through_the_park.svg"
    },
    {
      title: "Step 2",
      description: "description 2",
      image: "images/through_the_park.svg"
    },
    {
      title: "Step 3",
      description: "description 3",
      image: "images/through_the_park.svg"
    }
  ];
</script>

<OmoHeader omoheader={dreamheader} />
<OmoVideo {omovideo} />
<OmoSteps {omosteps} />
<OmoDreams {db} {currentId} />
<OmoEnkels {db} {currentId} />
<OmoCities {db} {currentId} />
