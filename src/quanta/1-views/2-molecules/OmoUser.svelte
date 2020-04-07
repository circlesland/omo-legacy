<script>
  export let db;
  export let currentId;
  export let user;
  if (!user) users = db.uers.find(d => d.id == currentId);

  // export let button = {
  //   name: "button",
  //   link: "user?id={user.id}"
  // };
</script>

<div class="w-1/3 p-2">
  <a href="user?id={user.id}">
    <div class="primary omo-border overflow-hidden omo-shadow">
      <img
        src={user.image}
        class="primary h-64 w-full rounded-t-lg object-cover object-center"
        alt="image" />
      <div
        class="text-2xl text-center p-4 text-gray-200 bg-blue-800 flex flex-wrap
        justify-center content-center h-48"
        style="font-family: 'Permanent Marker', cursive !important;">
        "{user.name} {user.dream}"
      </div>
      <!-- <div
        class="mt-4 w-full px-4 pt-1 pb-1 text-center hover:bg-orange-300
        hover:text-gray-800 bg-ci text-gray-100">
        <a
          href="user?id={user.id}"
          class="text-lg font-semibold"
          style="font-family: 'Indie Flower'!important;">
          näher kennenlernen
        </a>
      </div> -->
    </div>
  </a>
</div>
