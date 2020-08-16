<script lang="ts">
  import { TextileAdapter } from "@omo/textile-adapter/dist/TextileAdapter";
  import OmoTheme from "./OmoTheme.svelte";
  import Compositor from "./blocks/Compositor.svelte";
  import OmoList from "./blocks/molecules/OmoList.svelte";

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
  var foo = new TextileAdapter();
  foo.init();
</script>

<OmoTheme />
<OmoList />
<Compositor composition={App} />
