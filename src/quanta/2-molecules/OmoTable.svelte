<script>
  export let header = [];
</script>

<table class="w-full border">
  <thead class="">
    <tr class="bg-gray-200 text-xs text-left text-gray-600 uppercase">
      {#each header as head}
        <th class="px-2 py-1 text-xs">{head.title}</th>
      {/each}
    </tr>
  </thead>
  <tbody class="bg-white">
    <slot />
  </tbody>
</table>
