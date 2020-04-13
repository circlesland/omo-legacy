<script>
  import OmoMenuHorizontal from "./../2-molecules/OmoMenuHorizontal.svelte";
  import OmoQuantaList from "./../2-molecules/OmoQuantaList.svelte";
  import router, { curRoute, curId } from "./../../../router.js";
  import { onMount } from "svelte";
  import db from "./../../4-data/db.js";

  let currentId;

  onMount(() => {
    curRoute.set(window.location.pathname);
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("id")) {
      curId.set(urlParams.get("id"));
      currentId = urlParams.get("id");
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

<div class="h-full flex flex-col">
  <header>
    <div class="bg-gray-900 p-2 text-gray-300">omo-home {currentId}</div>
  </header>
  <div class="flex flex-1 overflow-hidden">
    <div class="overflow-y-scroll bg-gray-200 w-1/4 border-r border-gray-300">
      <OmoQuantaList />
    </div>
    <div class="overflow-y-scroll w-3/4">
      <div class="h-full">
        <svelte:component this={router[$curRoute]} {db} {currentId} />
      </div>
    </div>
  </div>

  <footer>
    <OmoMenuHorizontal />
  </footer>
</div>

<!-- 
<div class="flex flex-col h-full w-full">
  <header class="sticky top-0 w-full" style="z-index:100000">
    <div class="bg-gray-400">context title</div>
  </header>
  <div class="flex-1 mx-auto">
    <svelte:component this={router[$curRoute]} {db} {currentId} />
  </div>
  <footer class="w-full fixed-bottom-0 h-14 z-index:10000">
    <OmoMenuHorizontal />
  </footer>
</div> -->

<!-- <div class="bg-gray-200 w-64 border-r border-gray-300">
    <OmoQuantaList />
  </div>
  <div class="flex-1 flex overflow-hidden">
    <div class="overflow-y-scroll w-full">
      <div class="sticky top-0 w-full" style="z-index:100000">
        <div class="bg-gray-400">context title</div>
      </div>
      <div class="w-full h-full">
        <svelte:component this={router[$curRoute]} {db} {currentId} />
      </div>
    </div>
  </div>
  <div class="fixed bottom-0 w-full h-14" style="z-index:100000">
    <OmoMenuHorizontal />
  </div> -->
