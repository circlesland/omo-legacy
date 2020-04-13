<script>
  export let db;
  export let currentId;
  import OmoNavbar from "./../2-molecules/OmoNavbar.svelte";
  import OmoSteps from "./../3-organisms/OmoSteps.svelte";
  import OmoCities from "./../3-organisms/OmoCities.svelte";
  import OmoUsers from "./../3-organisms/OmoUsers.svelte";
  import OmoSubscribe from "./../2-molecules/OmoSubscribe.svelte";

  import quanta from "./../../4-data/quanta.js";

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

{#each $quanta as quant}
  <svelte:component this={quant.component} {quant} />
{/each}

<!-- 
<OmoSteps {omosteps} />

<OmoUsers {db} {currentId} />
<OmoSubscribe /> -->
