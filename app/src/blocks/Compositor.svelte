<script lang="ts">
  import { Composition } from "../interfaces/composition";

  export let composition;

  let w = window;
</script>

<style>
  .compositor {
    height: 100%;
    display: grid;
    grid-template-areas: var(--areas);
    grid-template-columns: var(--columns);
    grid-template-rows: var(--rows);
    overflow: hidden;
  }
</style>

{#if !composition.children || composition.children.length == 0}
  <section
    style="grid-area: {composition.area}; display: grid; grid-template-columns:
    'minmax(1fr)'; grid-template-rows: 'minmax(1fr)'; overflow: hidden;">
    <svelte:component
      this={w.registrar.findBlockByName(composition.component)}
      data={composition.data} />
  </section>
{:else}

  <section
    class="compositor"
    style="grid-area: '{composition.area}'; --areas: {composition.layout.areas};
    --columns: {composition.layout.columns}; --rows: {composition.layout.rows}; ">
    {#each composition.children as child}
      <svelte:self composition={child} />
    {/each}
  </section>
{/if}
