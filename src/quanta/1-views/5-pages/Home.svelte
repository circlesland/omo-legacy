<script>
  export let db;
  export let currentId;
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoVideo from "./../2-molecules/OmoVideo.svelte";
  import OmoSteps from "./../3-organisms/OmoSteps.svelte";
  import OmoCities from "./../3-organisms/OmoCities.svelte";
  import OmoUsers from "./../3-organisms/OmoUsers.svelte";

  export let dreamheader = {
    title: "Wir haben einen Traum...",
    subtitle: "...stell dir vor du stehts auf und alles läuft"
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
<OmoUsers {db} {currentId} />
<OmoCities {db} {currentId} />
