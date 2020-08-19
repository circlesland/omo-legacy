<script>
  import OmoOrganism from "./OmoOrganism";
  import OmoMolecule from "./OmoMolecule";

  export let organisms = {
    name: "Organisms",
    type: "organisms",
    layout: {
      areas: "'full'",
      columns: "1fr",
      rows: "1fr"
    },
    blocks: [
      {
        type: "molecule",
        slot: "molecule",
        quant: OmoMolecule,
        data: {name: "I am an block"}
      },
      {
        type: "organism",
        slot: "organim",
        layout: layout,
        blocks: []
      }
    ]
  };
</script>

<style>
  .organisms {
    height: 100%;
    display: grid;
    grid-template-areas: var(--areas);
    grid-template-columns: var(--columns);
    grid-template-rows: var(--rows);
    overflow: hidden;
  }
</style>

<section
        class="organisms"
        style="--areas: {organisms.layout.areas}; --columns: {organisms.layout.columns};
  --rows: {organisms.layout.rows}; ">
  {#each organisms.blocks as block}
    {#if block.type == 'molecule'}
      <OmoMolecule transfer={JSON.stringify(block)}/>
    {:else}
      <OmoOrganism transfer={JSON.stringify(block)}/>
    {/if}
  {/each}
</section>
