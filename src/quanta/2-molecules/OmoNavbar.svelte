<script>
  import { curRoute } from "./../../router.ts";
</script>

<div
  class="flex content-center"
  style="font-family: 'Montserrat', sans-serif !important;">
  <div class="w-full my-1">
    <div class="flex justify-center">
    <button class="px-1 hover:text-green-400 uppercase text-center text-sm font-bold"
    on:click={() => curRoute.set('?route=home')}>
      Home
  </button>
    <button class="px-1 hover:text-green-400 uppercase text-center text-sm font-bold"
      on:click={() => curRoute.set('?route=imprint')}>
        Imprint
    </button>
  </div></div>
</div>


