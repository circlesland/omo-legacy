<script>
  export let db;
  export let currentId;
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoVideo from "./../2-molecules/OmoVideo.svelte";
  import OmoSteps from "./../3-organisms/OmoSteps.svelte";
  import OmoCards from "./../3-organisms/OmoCards.svelte";
  import OmoUsers from "./../3-organisms/OmoUsers.svelte";
  import OmoStories from "./../2-molecules/OmoStories.svelte";

  export let omoheader = {
    title: "Wir haben einen Traum..."
  };
  export let omovideo = {
    link: "https://www.youtube.com/embed/HfzZQvoJATA"
  };
  export let omosteps = [
    {
      title: "Stadt wünschen",
      description:
        "Wünsch dir deine Stadt um die Flatrate in deiner Heimat freizuschalten",
      image: "images/city_girl.svg"
    },
    {
      title: "Fahrer voten",
      description:
        "Mit deinem Vote ermöglichst du einem Fahrer den Start in die Selbstständigkeit",
      image: "images/city_driver.svg"
    },
    {
      title: "Durchstarten",
      description:
        "Bei genügend Votes wird deine Stadt und dein Fahrer für alle freigeschalten",
      image: "images/order_a_car.svg"
    }
  ];
</script>

<OmoHeader {omoheader} />
<OmoVideo {omovideo} />
<OmoSteps {omosteps} />
<OmoCards {db} {currentId} />
<OmoUsers {db} {currentId} />
<OmoStories />
