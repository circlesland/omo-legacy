<script>
  import OmoMarkdown from "./../3-organisms/OmoMarkdown";

  import Overview from "./../../docs/Overview.svx";
  import Introduction from "./../../docs/Introduction.svx";
  import OmoEarthPOC from "./../../docs/OmoEarthPOC.svx";
  import OmoIdentity from "./../../docs/OmoIdentity.svx";
  import OmoBlocks from "./../../docs/OmoBlocks.svx";
  import DesignSystem from "./../../docs/DesignSystem.svx";
  import ModelDesigner from "./../../docs/ModelDesigner.svx";
  import GraphQLEditor from "./../../docs/GraphQLEditor.svx";
  import DataStore from "./../../docs/DataStore.svx";
  import Circles from "./../../docs/Circles.svx";
  import OmoActions from "./../../docs/OmoActions.svx";

  const blogs = [
    {text: "Overview", component: Overview},
    {text: "Introduction", component: Introduction},
    {text: "OmoActions", component: OmoActions},
    {text: "Odentity", component: OmoIdentity},
    {text: "OmoEarthPOC", component: OmoEarthPOC},
    {text: "Design System", component: DesignSystem},
    {text: "Omo Blocks", component: OmoBlocks},
    {text: "Model Designer", component: ModelDesigner},
    {text: "GraphQL Editor", component: GraphQLEditor},
    {text: "Data Store", component: DataStore},
    {text: "Circles UBI Protocol", component: Circles}
  ];
  let selected = blogs[0];
</script>

<style>
  .list {
    @apply py-4 px-6 bg-gray-100;
  }

  .item {
    @apply text-lg;
  }
</style>

<h1>TODO - fix layout and markdown styling</h1>
<ul class="list">
  {#each blogs as blog}
    <li class="item hover:text-green-500" on:click={() => (selected = blog)}>
      {blog.text}
    </li>
  {/each}
</ul>

<OmoMarkdown>
  <svelte:component this={selected.component}/>
</OmoMarkdown>
