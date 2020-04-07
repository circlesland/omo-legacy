<script>
  import OmoEarn from "./../2-molecules/OmoEarn.svelte";
  // export let db;
  // import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  // import OmoUser from "./../2-molecules/OmoUser.svelte";

  // export let users;
  // export let omoheader = {
  //   title: "Unsere Fahrer",
  //   subtitle: "subtitle"
  // };
  // if (!users) users = db.users;
</script>

<!-- <OmoHeader {omoheader} />
<div class="flex justify-center pb-40">
  <div class="w-5/6 xl:w-4/6">
    <div class="flex content-start flex-wrap">
      {#each users as user, i (user.id)}
        <OmoUser {user} {db} />
      {/each}
    </div>
  </div>
</div> -->

<OmoEarn />

<div class="text-center py-20 ">
  Slogan: Ob mit dem Fahrad, der Rikscha, dem Auto oder Kleinbus such es dir aus
  <br />
  <br />
  <br />
  Detail 1 - Als Fahrer in deiner Stadt anmelden und Votes sammeln
  <br />
  <br />
  Detail 2 - Freischaltung als Fahrer mit mindestens 50 Votes
  <br />
  <br />
  Detail 3 - Weitere Votes sammeln und dein Stundenlohn erhöhen
</div>
