<script>
  export let text;
</script>

<td class="py-2 px-4">
  <p class="text-sm text-gray-700 font-medium">
    {#if text.name}{text.name}{:else}{text}{/if}
  </p>
</td>
