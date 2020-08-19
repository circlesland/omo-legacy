<svelte:options tag="omo-list" />
<script lang="ts">
    /**
     * TODO: Support ArrayLike and async iterators as item source.
     */
    export let items: (object & {_id:string, $schemaId:string})[] = [{
        _id: "1",
        $schemaId: "https://example.com/message.schema.json",
        message: "Test 1"
    },{
        _id: "2",
        $schemaId: "https://example.com/test.schema.json",
        test: "Test 2"
    },{
        _id: "3",
        $schemaId: "https://example.com/message.schema.json",
        message: "Test 3"
    }];

    export let selected = null;

    let actions : Action[] = [];
    let w = window;

    function select(item) {
        selected = item;
        actions = [];

        if (!selected) {
            return;
        }

        const foundActions = w.o.seeder.findActionsForObject(selected);
        if (!foundActions || foundActions.length === 0){
            return;
        }

        actions = foundActions;
    }
</script>

<style>
</style>

{#if !items || items.length === 0}
  <!-- TODO: Display "No entries" message or similar -->
{:else}
      {#each items as item}
        {#if selected && item._id === selected._id}
            <div style="background:#009; color:#fff;" on:click={select(item)}>
                <svelte:component
                        this={w.o.seeder.findViewForObject(item)}
                        data={item} />
            </div>
        {:else}
            <div on:click={select(item)}>
                <svelte:component
                        this={w.o.seeder.findViewForObject(item)}
                        data={item} />
            </div>
        {/if}
      {/each}
      {#each actions as action}
          <span on:click={action.action}>Action: {action.title}</span>
      {/each}
{/if}
