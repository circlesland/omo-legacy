<script>
  import OmoButton from "./../1-atoms/OmoButton.svelte";
  export let chat = {
    text: "Call to Action"
  };
</script>

<header class="bg-gray-900">
  <nav class="flex justify-between w-full px-3 py-3">
    <div class="flex">
      <a href="/" class="mr-4">
        <img src="images/logo.png" alt="image" class="w-auto h-8" />
      </a>
    </div>
    <div class="content-center flex">
      <div class="flex">
        <a
          href="pricing"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          Preise
        </a>
        <a
          href="cities"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          Städte
        </a>
        <a
          href="team"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          Team
        </a>
        <a
          href="faq"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4
          mr-8">
          FAQ
        </a>
        <OmoButton button={chat} />
      </div>
    </div>
  </nav>
</header>
