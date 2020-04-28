<script>
  export let header = [];
</script>

<div style="overflow-x:auto;">
  <table class="w-full shadow-lg rounded ">
    <thead class="">
      <tr class=" text-gray-600 text-left bg-gray-300 uppercase">
        {#each header as head}
          <th class="px-2 py-1 text-sm">{head.title}</th>
        {/each}
      </tr>
    </thead>
    <tbody class="bg-white">
      <slot />
    </tbody>
  </table>
</div>
