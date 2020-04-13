<script>
  export let db;
  export let currentId;
  import OmoNavbar from "./../2-molecules/OmoNavbar.svelte";
  import OmoHero from "./../2-molecules/OmoHero.svelte";
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoVideo from "./../2-molecules/OmoVideo.svelte";
  import OmoSteps from "./../3-organisms/OmoSteps.svelte";
  import OmoCards from "./../3-organisms/OmoCards.svelte";
  import OmoUsers from "./../3-organisms/OmoUsers.svelte";
  import OmoSubscribe from "./../2-molecules/OmoSubscribe.svelte";

  import OmoQuanta from "./../../4-data/OmoQuanta.js";

  //   export let omosteps = [
  //     {
  //       title: "Stadt wünschen",
  //       description:
  //         "Wünsch dir deine Stadt um die Flatrate in deiner Heimat freizuschalten",
  //       image: "images/city_girl.svg"
  //     },
  //     {
  //       title: "Votes sammeln",
  //       description:
  //         "Mit jedem Vote kommt deine Stadt ein Schritt näher an die Flatrate",
  //       image: "images/city_driver.svg"
  //     },
  //     {
  //       title: "Durchstarten",
  //       description:
  //         "Bei genügend Votes wird deine Stadt und dein Fahrer für alle freigeschalten",
  //       image: "images/order_a_car.svg"
  //     }
  //   ];
</script>

{#each $OmoQuanta as item}
  <svelte:component
    this={item.model.component}
    model={item.model}
    data={item.data}
    design={item.design} />
{/each}
<!-- 
<OmoVideo {omovideo} />
<OmoSteps {omosteps} />
<OmoCards {db} {currentId} />
<OmoUsers {db} {currentId} />
<OmoSubscribe /> -->
