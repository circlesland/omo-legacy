<script>
  import OmoCardDream from "../2-molecules/OmoCardDream.svelte";
  import OmoCardPreOrder from "../2-molecules/OmoCardPreOrder.svelte";
  import { onMount } from "svelte";
  import { Dreams } from "../../queries/omo/dreams/dreams";
  import { observe } from "svelte-observable";

  export let leap;

  let omodreams = observe(Dreams.all(leap));
  $: {
    omodreams = observe(Dreams.all(leap));
  }
</script>

<div class="px-4 py-4 md:p-16 lg:py-20 lg:px-32 overflow-y-scroll">

  <section
    class="grid gap-10 mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

    {#await $omodreams}
      loading..
    {:then omodreams}
      {#each omodreams as data}
        {#if leap == '1'}
          <OmoCardDream {data} />
        {:else if leap == '2'}
          <OmoCardPreOrder {data} />
        {:else if leap == '3'}
          <OmoCardPreOrder {data} />
        {:else if leap == '4'}{JSON.stringify(data)}{/if}
      {/each}
    {/await}
  </section>

</div>
