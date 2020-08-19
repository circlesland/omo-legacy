<script>
  import OmoOrganisms from "./../4-layouts/OmoOrganisms.svelte";
  import OmoSpin from "./../1-atoms/OmoSpin.svelte";
  import {
    loadingSafeDataAsync,
    loadingTransferDataAsync
  } from "./../../queries/omo/safe/circles";

  async function loadingData() {
    let d = {};
    if (window.o.odentity.current == null) {
      navigate("omoauth"); // add redirect ...
      return;
    }
    let safeAddress = window.o.odentity.current.circleSafe.safeAddress.toLowerCase();

    d.safeData = await loadingSafeDataAsync(safeAddress);
    d.transferData = await loadingTransferDataAsync(safeAddress);
    d.safeAddress = safeAddress;

    let OmoSafe = {
      name: "OmoSafe",
      type: "organisms",
      layout: {
        areas: "'head' 'main'",
        columns: "1fr",
        rows: "12rem 1fr"
      },
      blocks: [
        {
          type: "molecule",
          slot: "head",
          quant: "OmoCirclesBalance",
          data: await d
        },
        {
          type: "molecule",
          slot: "main",
          quant: "OmoCircles",
          data: await d
        }
      ]
    };
    return await OmoSafe;
  }
</script>

{#await loadingData()}
  <OmoSpin/>
{:then organisms}
  <OmoOrganisms {organisms}/>
{/await}
