<script lang="ts">
    /**
     * TODO: Support ArrayLike and async iterators as item source.
     */
    export let items = [{
        $schemaId: "https://example.com/message.schema.json",
        message: "Test 1"
    },{
        $schemaId: "https://example.com/test.schema.json",
        test: "Test 2"
    },{
        $schemaId: "https://example.com/message.schema.json",
        message: "Test 3"
    }];

    let w = window;
</script>

<style>
</style>

{#if !items || items.length == 0}
  <!-- TODO: Display "No entries" message or similar -->
{:else}
      {#each items as item}
          <svelte:component
                  this={w.registrar.findListItem(item)}
                  data={item} />
      {/each}
{/if}
