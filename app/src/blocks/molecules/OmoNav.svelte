<script lang="ts">
  import IconsFontAwesome from "./../atoms/IconsFontAwesome.svelte";

  // import ActionsList from "./ActionsList.svelte";
  //import OmoModal from "./OmoModal.svelte";
  // import { onMount } from "svelte";
  // import OmoDialog from "../5-dapps/OmoDialog.svelte";
  // import { SubmitFlowStep } from "../../events/omo/shell/submitFlowStep";

  // let isOpen = false;

  // let triggerRef;

  // let page = "";
  // let actions = [];
  // let processNode = undefined;

  // onMount(() => {
  //   let notifications = window.o.eventBroker.tryGetTopic("omo", "shell");
  //   notifications.observable.subscribe(next => {
  //     if (!next._$schemaId) return;

  //     switch (next._$schemaId) {
  //       case "events:omo.shell.navigated":
  //         processNode = false;
  //         page = next.data.page;
  //         const route = window.routes.find(o => o.route === "?page=" + page); // TODO: Pfui!
  //         if (route && route.actions) {
  //           actions = route.actions;
  //         } else {
  //           actions = [];
  //         }
  //         break;
  //       case "events:omo.shell.startFlow":
  //         actions = false;
  //         processNode = false;
  //         const flowImpl = window.flowRegistrar.get(next.data.flow);
  //         if (!flowImpl) {
  //           throw new Error(
  //             "Couldn't find a flow with id '" +
  //               next.data.flow +
  //               "' in 'window.flowRegistrar'"
  //           );
  //         }
  //         processNode = flowImpl(next.data.argument);
  //         if (!isOpen) isOpen = true;
  //         break;
  //       case "events:omo.shell.closePopup":
  //         isOpen = false;
  //         break;
  //     }
  //   });
  // });

  export let navitems = [
    {
      icon: "fa-user-shield",
      text: "OmoSafe",
      // link: () => window.navigate("omosafe"),
      design: "text-secondary hover:bg-white",
    },
    {
      icon: "fa-users",
      text: "Dreams",
      // link: () => window.navigate("omomarket"),
      design: "text-secondary hover:bg-white",
    },
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
    {
      icon: "fa-comments",
      text: "OmoTalk",
      // link: () => window.navigate("omochat"),
      design: "text-secondary hover:bg-white",
    },
    {
      icon: "fa-user-circle",
      text: "MyProfile",
      // link: () => window.navigate("odentity"),
      design: "text-secondary hover:bg-white",
    },
  ];
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
    <!--
    {#each navitems as item}
      <li href="#" on:click={() => item.link()} class="{item.design} p-2">
      <div>
        <i class="text-lg fas {item.icon}" />
        <br />
        <span class="text-xs uppercase">{item.text}</span>
      </div>
      </li>
    {/each}-->
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
  </ul>
</nav>
