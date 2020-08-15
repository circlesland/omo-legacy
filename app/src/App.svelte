<script lang="ts">
  import OmoTheme from "./OmoTheme.svelte";
  import Compositor from "./blocks/Compositor.svelte";

  export let name: string;
  name = "omo earth starter";

  let App = {
    layout: {
      areas: "'main' 'footer'",
      columns: "1fr",
      rows: "1fr 4rem",
    },
    component: "Compositor",
    children: [
      {
        area: "main",
        component: "OmoBanner",
        data: {
          title: "follow your dreams",
          image: "/images/inspire.jpg",
          action: "javascript:navigate('omoauth')",
          button: "Start dreaming",
        },
      },
      {
        area: "footer",
        component: "OmoNav",
      },
    ],
  };
</script>

<style>
  h1 {
    color: purple;
  }

  .btn-red {
    @apply bg-red-500 text-white font-bold py-2 px-4 rounded;
  }

  .btn-red:hover {
    @apply bg-red-700;
  }
</style>

<OmoTheme />
<Compositor composition={App} />
