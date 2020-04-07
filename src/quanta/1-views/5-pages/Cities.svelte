<script>
  import OmoCard from "./../2-molecules/OmoCard.svelte";
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  export let db;
  let cities = db.cities;
  export let omoheader = {
    title: "Die Städte Kampagne",
    subtitle: "so funktiniert sie im detail"
  };
</script>

<OmoHeader {omoheader} />
<div class="text-center py-20 ">
  Detail 1 - Votingphase mit unverbindlicher Vorbestellung der Flatrate
  <br />
  <br />
  Detail 2 - Voting Ziel erreicht -> Verbindliche einmalige Crowdfunding Zahlung
  für Erschließung der Stadt
  <br />
  <br />
  Detail 3 - Gemeinsam Stadt freischalten und Monatsflat buchen
</div>

<div class="flex justify-center my-10 pb-20">
  <div class="w-5/6 xl:w-4/6">
    <div class="flex">
      {#each cities as city}
        <OmoCard {city} {db} />
      {/each}
    </div>
  </div>
</div>
