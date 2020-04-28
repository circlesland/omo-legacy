<script>
  export let value;
</script>

<td class="hidden md:table-cell">

  <p class="text-sm text-gray-700 font-medium p-3">
    {#if value.name}{value.name}{:else}{value}{/if}
  </p>
</td>
