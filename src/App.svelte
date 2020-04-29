<script>
  import router, { curId, curRoute } from "./router.ts";
  import { onMount } from "svelte";
  import OmoNavbar from "./quanta/2-molecules/OmoNavbar.svelte";
  import OmoList from "./quanta/2-molecules/OmoList.svelte";

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

<svelte:window on:popstate={handlerBackNavigation} />
<OmoNavbar />
<div class="h-full flex flex-col ">
  <!-- <header class="bg-gray-200 text-sm font-semibold py-2 px-3 text-blue-900">
    context: (schema name)
  </header> -->
  <div class="h-full flex overflow-hidden">
    <div
      class="overflow-y-scroll bg-gray-100 border-t border-r border-gray-200
      w-64">
      <OmoList routes={router} />
    </div>
    <div class="h-full flex-1 overflow-y-scroll">
      <div class="h-full w-full py-12 px-16">
        <svelte:component this={router.find(x => x.route == $curRoute).quant} />
      </div>
    </div>
  </div>
</div>
,
