<script>
  import OmoList from "./../2-molecules/OmoList.svelte";
  import OmoBooksTable from "./../2-molecules/OmoBooksTable.svelte";
</script>

<div class="h-full flex flex-col ">
  <!-- <header class="bg-gray-200 text-sm font-semibold py-2 px-3 text-blue-900">
    context: (schema name)
  </header> -->
  <div class="h-full flex overflow-hidden">
    <div
      class="overflow-y-scroll bg-gray-100 border-t border-r border-gray-200
      w-64">
      <OmoList />
    </div>
    <div class="h-full flex-1 overflow-y-scroll">
      <div class="h-full w-full py-12 px-16">
        <OmoBooksTable />
      </div>
    </div>
  </div>
</div>
