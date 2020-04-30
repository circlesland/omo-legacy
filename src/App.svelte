<script>
  import router, { curId, curRoute } from "./router.ts";
  import { onMount } from "svelte";
  import OmoNavbar from "./quanta/2-molecules/OmoNavbar.svelte";
  import OmoList from "./quanta/2-molecules/OmoList.svelte";
  import OmoBooksTable from "./quanta/2-molecules/OmoBooksTable.svelte";
  import OmoMenuVertical from "./quanta/2-molecules/OmoMenuVertical.svelte";

  let currentId;

  onMount(() => {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("route")) {
      curRoute.set("?route=" + urlParams.get("route"));
    }
    if (!history.state) {
      window.history.replaceState(
        { path: window.location.pathname },
        "",
        window.location.href
      );
    }
  });

  function handlerBackNavigation(event) {
    curRoute.set(event.state.path);
  }
</script>

<svelte:window on:popstate={handlerBackNavigation} />

<div class="flex flex-col h-full">
  <header
    class="bg-gray-200 text-sm font-semibold py-2 px-3 text-blue-900 uppercase
    border-b border-gray-300 text-center">
    Context Title
  </header>
  <main class="h-full flex-1 flex overflow-hidden">
    <svelte:component
      this={router.find(x => x.route == $curRoute).quant}
      {router}
      curRoute={$curRoute} />
  </main>
  <footer>
    <OmoNavbar />
  </footer>
</div>
