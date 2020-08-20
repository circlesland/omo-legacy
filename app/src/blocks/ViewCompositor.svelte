<svelte:options tag="omo-view-compositor" />
<script lang="ts">
  import { Component } from "../interfaces/component";
  import {Manifest} from "../interfaces/manifest"
  import {OmoRuntime} from "../omoRuntime";
  import {ModelCompositor} from "../ModelCompositor";

  export const manifest:Manifest = {
    name: "ViewCompositor",
    tag: "omo-view-compositor",
    properties: []
  };

  export let composition: Component;

  async function refreshData(leaf) {
    const runtime = (await OmoRuntime.get());
    const leafTagName = runtime.seeder.findTagNameByComponentName(composition.component.name);

    if (leaf && leaf.getElementsByTagName(leafTagName).length > 0) {
      let item = leaf.getElementsByTagName(leafTagName).item(0);
      const data = await ModelCompositor.findData(composition.component.properties);
      console.log("Setting data on custom element", item, data);
      item["data"] = data;
    }
  }

  async function refresh(composition:Component, leaf:HTMLElement) {
    const runtime = (await OmoRuntime.get());
    if (!window.o) {
      // TODO: Do this only when in debug mode: window.o = runtime;
      window.o = runtime;
    }
    if (!composition || !composition.component || !composition.component.name) {
      return;
    }
    await refreshData(leaf);

    ModelCompositor.subscribeToBlockChanges(composition._id, runtime.textile).subscribe(async change => {
      await refreshData(leaf);
    });
  }

  let leaf:HTMLElement;
  $: {
    refresh(composition, leaf);
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
      {#await OmoRuntime.get()}
        Initializing runtime ..
      {:then runtime}
        {@html "<" + runtime.seeder.findTagNameByComponentName(composition.component.name) + "\>"}
    {/await}
    </div>
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
