<script>
  export let row = {};
</script>

<tr class="accordion border-b border-grey-light hover:bg-gray-100">

  {#each Object.values(row) as field}
    <td class="hidden md:table-cell">
      <p class="text-sm text-gray-700 font-medium p-3">
        {#if field.name}{field.name}{:else}{field}{/if}
      </p>
    </td>
  {/each}

</tr>
