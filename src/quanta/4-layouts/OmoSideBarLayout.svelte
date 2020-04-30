<script>
  import OmoList from "./../2-molecules/OmoList.svelte";
  import OmoNavbar from "./../2-molecules/OmoNavbar.svelte";
  import OmoBooksTable from "./../2-molecules/OmoBooksTable.svelte";
  import OmoMenuVertical from "./../2-molecules/OmoMenuVertical.svelte";

  export let router;
  export let curRoute;
</script>

<div class="h-full border-r border-gray-200">
  <OmoMenuVertical />
</div>
<div
  class="h-full overflow-y-scroll bg-gray-100 border-t border-r border-gray-200
  w-64">
  <OmoList routes={router} />
</div>
<div class="h-full flex-1 overflow-y-scroll py-20 px-24">
  <svelte:component this={router.find(x => x.route == curRoute).subQuant} />
</div>
