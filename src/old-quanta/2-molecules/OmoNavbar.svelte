<script>
  import OmoButton from "./../1-atoms/OmoButton.svelte";
  export let button = {
    text: "Call to Action"
  };
</script>

<header class="bg-gray-800">
  <nav class="flex justify-between w-full px-3 py-3">
    <div class="flex">
      <a href="/" class="mr-4">
        <img
          src="/images/logo.png"
          alt="image"
          class="w-auto h-8" />
      </a>
    </div>
    <div class="content-center flex">
      <div class="flex">
        <a
          href="/"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          Link 1
        </a>
        <a
          href="/"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          Link 2
        </a>
        <a
          href="/"
          class="hover:text-green-400 text-white pt-1 font-bolt font-mono mx-4 ">
          Link 3
        </a>
        <OmoButton {button} />
      </div>
    </div>
  </nav>
</header>
