<script>
  import OmoCity from "./../2-molecules/OmoCity.svelte";
  // import OmoUsers from "./../3-organisms/OmoUsers.svelte";
  export let db;
  export let currentId;
  let city = db.cities.find(item => item.id == currentId);
  // let users = db.users.filter(item => item.user == user.id);
</script>

<div
  class="py-64 text-6xl w-full flex content-center flex-wrap bg-cover bg-center
  justify-center overflow-hidden uppercase font-bolt text-white"
  style="background-image: url('{city.image}'); font-family: 'Permanent Marker',
  cursive !important;"
  title={city.name}>
  {city.name}
</div>
<!-- 
<OmoUsers {users} {db} /> -->
