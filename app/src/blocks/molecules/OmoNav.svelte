<script lang="ts">
  import IconsFontAwesome from "./../atoms/IconsFontAwesome.svelte";
  import {Manifest} from "../../interfaces/manifest"

  export const manifest:Manifest = {
    name: "OmoNav",
    properties: [{
      name: "parameterizedActionIds",
      schema: "string[]",
      isOptional: false
    }]
  };

  export let data = {
    parameterizedActionIds: []
  }

  let navitems = [
    // {
    //   icon: "fa-plus",
    //   text: "Actions",
    //   link: () => {
    //     isOpen = !isOpen;
    //     if (!isOpen) {
    //       processNode = null;
    //     } else {
    //       const route = window.routes.find(o => o.route === "?page=" + page); // TODO: Pfui!
    //       actions = route.actions;
    //     }
    //   },
    //   design: "text-white bg-secondary hover:text-secondary hover:bg-white"
    // },
  ];

  async function refresh(lol) {
    console.log("OmoNav refresh")
    if (!lol || lol.length == 0)
      return;

    const items = await Promise.all(lol.map(async id => {
      const action = await window.o.graphQL.query(`ParameterizedActionById(_id:"${id}") { propertyValues { _id value property { _id name isOptional schema } } action { _id name title glyph } }`);
      return {
        text: action.data.ParameterizedActionById.action.title,
        icon: action.data.ParameterizedActionById.action.glyph,
        design: "text-secondary hover:bg-white"
      };
    }));

    navitems = items;
  }

  $:{
    const lol = data.parameterizedActionIds;
    refresh(lol);
  }

</script>

<!-- <OmoModal {triggerRef} bind:isOpen>
  {#if actions}
    <ActionsList {actions} />
  {/if}
  {#if processNode}
    <OmoDialog {processNode} />
  {/if}
</OmoModal> -->

<IconsFontAwesome />
<nav class="bottom-0 w-full bg-dark h-full">
  <ul
    class="flex justify-around md:justify-center items-center text-center
    font-semibold">
    {#each navitems as item}
      <li href="#" on:click={() => item.link()} class="{item.design} p-2">
      <div>
        <i class="text-lg fas {item.icon}" />
        <br />
        <span class="text-xs uppercase">{item.text}</span>
      </div>
      </li>
    {/each}
    <!--
    <li class="text-secondary hover:bg-white p-2">
      <div>
        <i class="text-lg fas fa-home" />
        <br />
        <span class="text-xs uppercase">Home</span>
      </div>
    </li>

    <li class="text-secondary hover:bg-white p-2">
      <div>
        <i class="text-lg fas fa-user-shield" />
        <br />
        <span class="text-xs uppercase">Safe</span>
      </div>
    </li>
    -->
  </ul>
</nav>
