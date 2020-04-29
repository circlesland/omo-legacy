<script>
  import OmoList from "./../2-molecules/OmoList.svelte";
  import OmoBooksTable from "./../2-molecules/OmoBooksTable.svelte";
  import OmoMenuVertical from "./../2-molecules/OmoMenuVertical.svelte";
</script>

<div class="h-full flex flex-col">
  <div class="h-full flex overflow-hidden">
    <!-- <div class="h-full border-r border-gray-200">
      <OmoMenuVertical />
    </div> -->
    <div
      class="h-full overflow-y-scroll bg-gray-100 border-t border-r
      border-gray-200 w-64">
      <OmoList />
    </div>
    <div class="h-full flex-1 overflow-y-scroll">
      <div class="h-full w-full py-12 px-16">
        <OmoBooksTable />
      </div>
    </div>
  </div>
</div>
