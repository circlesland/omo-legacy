<script>
  import { curRoute } from "./../../router.ts";
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";
</script>

<OmoIconsFA />

<div
  class="flex content-center bg-gray-200"
  style="font-family: 'Montserrat', sans-serif !important;">
  <div class="w-1/4 p-2">
    <button on:click={() => curRoute.set('?route=home')}>
      <img
        src="/images/logo.png"
        alt="alt placeholder"
        class="p-2 inline mx-auto"
        style="width: 2.75rem; margin-left: 0.15rem" />
    </button>
  </div>
  <div class="w-full p-2">
    <a href="https://github.com/omoearth/omo/issues/new/choose">
      <button class="w-full bg-green-500 px-4 py-1">
        <span
          class="px-1 text-white text-lg cursor-pointer uppercase text-sm
          font-bold ">
          <!-- <i class="fas fa-home p-2 bg-gray-800 rounded" /> -->
          Yes, I will challenge my dream
        </span>
      </button>
    </a>
  </div>
  <div class="w-1/4 p-2">
    <button
      class="relative cursor-pointer float-right py-2"
      on:click={() => curRoute.set('?route=imprint')}>
      <span class="px-1 hover:text-white uppercase text-sm font-bold">
        <!-- <img
        src="/images/samuel.jpg"
        alt="alt placeholder"
        class="h-8 inline mx-auto rounded border border-gray-600" /> -->
        Imprint
      </span>
    </button>
  </div>

</div>
