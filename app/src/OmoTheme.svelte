<svelte:options tag="omo-theme" />
<style glonal>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :global(html, body) {
    height: 100vh;
    width: 100vw;
    padding: 0;
    margin: 0;
  }

  :global(h1) {
    font-family: "Montserrat", sans-serif;
    font-weight: 900;
  }
  :global(font-title) {
    font-family: "Montserrat", sans-serif;
    font-weight: 900;
  }

  :global(h2) {
    @apply text-2xl pb-4;
  }

  :global(h3) {
    @apply text-xl pb-4 pt-4;
  }

  :global(p) {
    @apply pb-2;
  }

  :global(a) {
    @apply text-green-400;
  }

  :global(*:focus) {
    outline: none;
  }
</style>
