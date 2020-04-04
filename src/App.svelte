<script>
  import router, { curRoute, curId } from "./router.js";
  import OmoNavbar from "./quants/Omo-Navbar.svelte";
  import { onMount } from "svelte";
  import db from './db.js';

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

<style>

</style>

<svelte:window on:popstate={handlerBackNavigation} />
<div id="pageContent" class="app flex flex-col overflow-y-scroll">
  <div class="sticky top-0" style="z-index:100000">
    <OmoNavbar />
  </div>
  <svelte:component this={router[$curRoute]} {db} {currentId} />
</div>
