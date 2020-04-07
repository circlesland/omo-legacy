<script>
  import OmoCity from "./../2-molecules/OmoCity.svelte";
  export let db;
  export let user;
  export let currentId;
  if (!user) user = db.users.find(x => x.id == currentId);
  let city = db.cities.find(x => x.id == user.city);
</script>

<div
  class="py-64 text-4xl text-gray-700 w-full flex content-center flex-wrap
  bg-cover bg-center justify-center overflow-hidden"
  style="background-image: url('{user.image}')"
  title="user" />
<div
  class="text-5xl text-center px-4 py-16 text-gray-200 bg-blue-800 flex
  flex-wrap justify-center content-center">
  <p style="font-family: 'Permanent Marker', cursive !important;">
    "{user.name} {user.dream}"
  </p>
</div>
<div class="flex justify-center my-10">
  <div class="w-5/6 xl:w-4/6">
    <div class="flex justify-center">
      <OmoCity {city} {db} />
    </div>
  </div>
</div>
