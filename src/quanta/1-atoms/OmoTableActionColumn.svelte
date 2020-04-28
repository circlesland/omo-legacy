<script>
  export let text;
  export let action;
  //   function handleClick() {
  //     alert("delete");
  //   }
</script>

<td>
  <button
    on:click={action}
    class="text-sm bg-orange-400 rounded text-white py-1 px-3">
    {#if text.name}{text.name}{:else}{text}{/if}
  </button>
</td>
