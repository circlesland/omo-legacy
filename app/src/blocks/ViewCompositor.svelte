<svelte:options tag="omo-view-compositor" />
<script lang="ts">
  import { Component } from "../interfaces/component";
  import {Manifest} from "../interfaces/manifest"

  export const manifest:Manifest = {
    name: "ViewCompositor",
    properties: []
  };

  export let composition: Component;
  let w = window;

  let leaf:HTMLElement;
  $: {
    if (composition && composition.component && composition.component.name) {
      const leafTagName = w.o.seeder.findTagNameByComponentName(composition.component.name);
      if (leaf && leaf.getElementsByTagName(leafTagName).length > 0) {
        let item = leaf.getElementsByTagName(leafTagName).item(0);
        console.log("Custom nested element:", item);
        console.log("Custom nested element attributes:", item.attributes);
      }
    }
  }
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

    <div bind:this={leaf}>
    {@html w.o.seeder.findTagByComponentName(composition.component.name)}
    </div>
    <!--
    <svelte:component
      this={w.o.seeder.findComponentByName(composition.component.name)}
      data={composition.data} />-->
  </section>
{:else if composition}

  <section
    class="compositor"
    style="grid-area: '{composition.area}'; --areas: {composition.layout.areas};
    --columns: {composition.layout.columns}; --rows: {composition.layout.rows}; ">
    {#each composition.children as child}
      <omo-view-compositor composition={child}></omo-view-compositor>
    {/each}
  </section>
{:else}
  Loading..
{/if}
