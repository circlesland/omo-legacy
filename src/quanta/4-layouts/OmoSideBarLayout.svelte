<script>
  import OmoQuantTable from "./../2-molecules/OmoQuantTable.svelte";
  import OmoQuantGrid from "./../2-molecules/OmoQuantGrid.svelte";
  import OmoList from "./../2-molecules/OmoList.svelte";
  import OmoNavbar from "./../2-molecules/OmoNavbar.svelte";
  import OmoMenuVertical from "./../2-molecules/OmoMenuVertical.svelte";

  import { curRoute } from "./../../router.ts";

  export let router;
</script>

<!-- <div class="h-full border-r border-gray-200">
  <OmoMenuVertical />
</div> -->
<div
  class="h-full overflow-y-scroll bg-gray-100 border-t border-r border-gray-200
  w-64">
  <OmoList routes={router} />
</div>
<div class="h-full flex-1 overflow-y-scroll overflow-x-scroll py-20 px-24">
  <OmoQuantGrid quantId={router.find(x => x.route == $curRoute).ID} />
  <!-- <OmoQuantTable quantId={router.find(x => x.route == $curRoute).ID} /> -->
</div>
