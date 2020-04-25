<script>
  import Notifications from "svelte-notifications";
  import router, { curRoute, curId } from "./router.js";
  import OmoThemeLight from "./quanta/1-views/0-themes/OmoThemeLight.svelte";
  import OmoLayoutEditor from "./quanta/1-views/4-layouts/OmoLayoutEditor.svelte";
  import { onMount } from "svelte";

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

<Notifications>
  <div class="h-screen w-screen">
    <OmoLayoutEditor />
  </div>
</Notifications>
