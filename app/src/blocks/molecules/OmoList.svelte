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

    export let selected = null;

    let actions = [];
    let w = window;

    function select(item) {
        selected = item;
        actions = [];

        if (!selected) {
            return;
        }

        const foundActions = w.registrar.findActionsForItem(selected);
        if (!foundActions || foundActions.length === 0){
            return;
        }

        actions = foundActions;
    }
</script>

<style>
</style>

{#if !items || items.length == 0}
  <!-- TODO: Display "No entries" message or similar -->
{:else}
      {#each items as item}
        {#if item == selected}
            <div style="background:#009; color:#fff;" on:click={select(item)}>
                <svelte:component
                        this={w.registrar.findListItem(item)}
                        data={item} />
            </div>
        {:else}
            <div on:click={select(item)}>
                <svelte:component
                        this={w.registrar.findListItem(item)}
                        data={item} />
            </div>
        {/if}
      {/each}
      {#each actions as action}
          <span on:click={action.action}>Action: {action.title}</span>
      {/each}
{/if}
