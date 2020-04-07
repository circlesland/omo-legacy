<script>
  import OmoButton from "./../1-atoms/OmoButton.svelte";
  export let chat = {
    text: "JETZT STADT FREISCHALTEN",
    link: "/chat"
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
          href="drivers"
          class="uppercase text-green-400 hover:text-white pt-1 font-bolt
          font-mono mx-4">
          Fahrer werden
        </a>
        <a
          href="pricing"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          Preise
        </a>
        <a
          href="faq"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          FAQ
        </a>
        <a
          href="cities"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4
          mr-8">
          Städtekampagne
        </a>
        <!-- <a
          href="Profil"
          class="uppercase hover:text-green-400 text-white pt-1 font-bolt
          font-mono mx-4 mr-8"
          style="font-family: 'Permanent Marker', cursive !important;">
          Mein Profil
        </a> -->
        <OmoButton button={chat} />
      </div>
    </div>
  </nav>
</header>
