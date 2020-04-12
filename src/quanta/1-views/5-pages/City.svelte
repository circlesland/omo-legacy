<script>
  import OmoCard from "./../2-molecules/OmoCard.svelte";
  import OmoUsers from "./../3-organisms/OmoUsers.svelte";
  export let db;
  export let currentId;
  let city = db.cities.find(item => item.id == currentId);
  let users = db.users;
</script>

<div
  class="py-40 text-6xl w-full flex content-center flex-wrap bg-cover bg-center
  justify-center overflow-hidden uppercase font-bold text-white font-title"
  title={city.name}>
  {city.name}
</div>

<OmoUsers {users} {db} />
