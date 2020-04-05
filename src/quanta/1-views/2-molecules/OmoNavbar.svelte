<script>
  import OmoButton from "./../1-atoms/OmoButton.svelte";
  export let meetme = {
    text: "MeetMe",
    link: "/meetme"
  };
  export let chat = {
    text: "Jetzt Lebensträume erfüllen",
    link: "/chat"
  };
</script>

<header class="bg-gray-900">
  <nav class="flex justify-between w-full p-4">
    <div class="flex">
      <a href="/" class="mr-4">
        <img src="images/logo_light.png" alt="image" class="w-auto h-8" />
      </a>
      <OmoButton button={meetme} />
    </div>
    <div class="md:items-center md:w-auto flex">
      <div class="flex">
        <OmoButton button={chat} />
      </div>
    </div>
  </nav>
</header>
