<script>
  export let text;
</script>

<td class="">
  <p class="text-sm text-gray-700 font-medium p-3">
    {#if text.name}{text.name}{:else}{text}{/if}
  </p>
</td>
