<script lang="ts">
  import { Component } from "../interfaces/component";
  import {Manifest} from "../interfaces/manifest"

  export const manifest:Manifest = {
    name: "ViewCompositor",
    properties: []
  };

  export let composition: Component;
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

{#if composition && (!composition.children || composition.children.length === 0)}
  <section
    style="grid-area: {composition.area}; display: grid; grid-template-columns:
    'minmax(1fr)'; grid-template-rows: 'minmax(1fr)'; overflow: hidden;">
    <svelte:component
      this={w.o.seeder.findComponentByName(composition.component.name)}
      data={composition.data} />
  </section>
{:else if composition}

  <section
    class="compositor"
    style="grid-area: '{composition.area}'; --areas: {composition.layout.areas};
    --columns: {composition.layout.columns}; --rows: {composition.layout.rows}; ">
    {#each composition.children as child}
      <svelte:self composition={child} />
    {/each}
  </section>
{/if}
