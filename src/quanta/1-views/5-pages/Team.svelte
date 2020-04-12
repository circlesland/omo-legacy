<script>
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoUser from "./../2-molecules/OmoUser.svelte";

  export let omoheader = {
    title: "Über uns",
    subline: "und das ganze Team"
  };
  export let db;
  export let users;

  if (!users) users = db.users;
</script>

<OmoHeader {omoheader} />

<div class="flex justify-center pb-40">
  <div class="w-5/6 xl:w-4/6">
    <div class="flex content-start flex-wrap">
      {#each users as user, i (user.id)}
        <OmoUser {user} {db} />
      {/each}
    </div>
  </div>
</div>
