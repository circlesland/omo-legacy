<script>
  import OmoFonts from "./quanta/1-atoms/OmoFonts";
  import { Quant } from "./schemas.ts";
  import { curId, curRoute } from "./router.ts";
  import { onMount } from "svelte";
  import OmoNavbar from "./quanta/2-molecules/OmoNavbar.svelte";
  import OmoList from "./quanta/2-molecules/OmoList.svelte";
  import OmoMenuVertical from "./quanta/2-molecules/OmoMenuVertical.svelte";
  import OmoHome from "./quanta/5-pages/OmoHome.svelte";
  import OmoTest from "./quanta/5-pages/OmoTest.svelte";
  import OmoDesign from "./quanta/5-pages/OmoDesign.svelte";
  import OmoSideBarLayout from "./quanta/4-layouts/OmoSideBarLayout.svelte";

  var router = [
    { route: "?route=home", quant: OmoHome, name: null },
    { route: "?route=test", quant: OmoTest, name: "test" },
    { route: "?route=design", quant: OmoDesign, name: "design" }
  ];

  let currentId;
  graphql("{Quants {ID name icon }}").then(result => {
    router = [
      { route: "?route=home", quant: OmoHome, name: null },
      { route: "?route=test", quant: OmoTest, name: "test" },
      { route: "?route=design", quant: OmoDesign, name: "design" }
    ];
    result.data.Quants.forEach(element => {
      router.push({
        route: `?route=${element.ID}`,
        quant: OmoSideBarLayout,
        name: element.name,
        ID: element.ID
      });
    });
  });
  subscribe("subscription {Quants {ID name icon }}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        router = [
          { route: "?route=home", quant: OmoHome, name: null },
          { route: "?route=test", quant: OmoTest, name: "test" },
          { route: "?route=design", quant: OmoDesign, name: "design" }
        ];

        value.data.Quants.forEach(element => {
          router.push({
            route: `?route=${element.ID}`,
            quant: OmoSideBarLayout,
            name: element.name,
            ID: element.ID
          });
        });
      }
    })();
  });
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

<style>
  .github-corner:hover .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
  @keyframes octocat-wave {
    0%,
    100% {
      transform: rotate(0);
    }
    20%,
    60% {
      transform: rotate(-25deg);
    }
    40%,
    80% {
      transform: rotate(10deg);
    }
  }
  @media (max-width: 500px) {
    .github-corner:hover .octo-arm {
      animation: none;
    }
    .github-corner .octo-arm {
      animation: octocat-wave 560ms ease-in-out;
    }
  }
</style>

<svelte:window on:popstate={handlerBackNavigation} />

<div
  class="flex flex-col h-full w-full text-blue-900"
  style="font-family: 'Muli', sans-serif !important">
  <!-- <header
    class="bg-gray-200 text-sm font-semibold py-2 px-3 text-blue-900 uppercase
    border-b border-gray-300 text-center">
    Top Navbar
  </header> -->
  <main class="h-full flex-1 flex overflow-hidden w-full">
    <svelte:component
      this={router.find(x => x.route == $curRoute).quant}
      {router} />
  </main>
  <footer>
    <OmoNavbar />
  </footer>
</div>

<a
  href="https://github.com/omoearth/omo-quantum"
  class="github-corner"
  aria-label="Follow us on GitHub">
  <svg
    width="80"
    height="80"
    viewBox="0 0 250 250"
    style="fill:#102137; color:2AD78B; position: absolute; top: 0; border: 0;
    right: 0;"
    aria-hidden="true">
    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
    <path
      d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6
      120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3
      125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
      fill="currentColor"
      style="transform-origin: 130px 106px;"
      class="octo-arm" />
    <path
      d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6
      C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0
      C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1
      C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4
      C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9
      C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5
      C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9
      L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
      fill="currentColor"
      class="octo-body" />
  </svg>
</a>
