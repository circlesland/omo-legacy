<script>
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoUser from "./../2-molecules/OmoUser.svelte";
  export let db;
  export let users;
  export let omoheader = {
    title: "Unsere Omo's",
    subline: "subtitle"
  };
  if (!users) users = db.users;
</script>

<div class="flex justify-center pt-20 pb-40">
  <div class="w-5/6 xl:w-4/6">
    <OmoHeader {omoheader} />
    <div class="flex content-start flex-wrap">
      {#each users as user, i (user.id)}
        <OmoUser {user} {db} />
      {/each}
    </div>
  </div>
</div>
