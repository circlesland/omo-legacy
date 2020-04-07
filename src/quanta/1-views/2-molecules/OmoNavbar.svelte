<script>
  import OmoButton from "./../1-atoms/OmoButton.svelte";
  export let chat = {
    text: "CALL TO ACTION",
    link: "/"
  };
</script>

<header class="bg-gray-900">
  <nav class="flex justify-between w-full px-3 py-3">
    <div class="flex">
      <a href="/" class="mr-4">
        <img src="images/logo.png" alt="image" class="w-auto h-8" />
      </a>
    </div>
    <div class="md:items-center md:w-auto flex">
      <div class="flex">
        <OmoButton button={chat} />
      </div>
    </div>
  </nav>
</header>
