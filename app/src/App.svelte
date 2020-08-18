<script lang="ts">
  import OmoTheme from "./OmoTheme.svelte";
  import ViewCompositor from "./blocks/ViewCompositor.svelte";
  import OmoList from "./blocks/molecules/OmoList.svelte";
  import {ModelCompositor} from "./ModelCompositor";

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
          /*
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
           */
      ],
  };

  async function a() {

      setTimeout(async () => {
          const modelCompositor = new ModelCompositor();
          const home = await modelCompositor.fromRoot("home")

          /*
          const root = await o.textile.graphQL.query('BlockByName(name:"home"){_id name component {_id name } children{_id name component { _id name } layout { _id name areas columns rows }}}');
          const home = root.data.BlockByName.children.find(o => o.name === "home"); // TODO: This should be done by the query. WTF?
           */
          console.log(home);
          App = home;
      }, 10000);
  }

  a();
</script>

<OmoTheme />
<ViewCompositor composition={App} />
