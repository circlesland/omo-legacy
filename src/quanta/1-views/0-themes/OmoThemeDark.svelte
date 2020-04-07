<script>
  import OmoDesignBase from "./OmoDesignBase.svelte";
  import OmoDesignUtilities from "./OmoDesignUtilities.svelte";
</script>

<style global>
  @tailwind components;

  .primary {
    @apply bg-gray-800 text-gray-100;
  }

  .app {
    @apply bg-gray-900 h-screen w-full;
  }

  .button {
    @apply bg-blue-900 text-white px-4 py-2 rounded-lg  uppercase font-semibold text-sm tracking-wider;
  }

  .button:hover {
    @apply bg-blue-800;
  }

  .button:active {
    @apply bg-green-400;
  }

  .omo-border {
    @apply border-solid border border-gray-500;
  }
</style>

<OmoDesignBase />
<OmoDesignUtilities />
