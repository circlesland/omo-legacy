<script lang="ts">
  import { getRoute, curRoute, navigate, getComponent } from "./Router.ts";
  import { onMount, onDestroy } from "svelte";
  import MagicLogin from "./quants/5-dapps/MagicLogin.svelte";

  import OmoHome from "./quants/5-dapps/OmoHome";
  import OmoDialog from "./quants/5-dapps/OmoDialog";
  import MamaOmo from "./quants/5-dapps/MamaOmo";
  import OmoDream from "./quants/5-dapps/OmoDream";
  import OmoDocs from "./quants/5-dapps/OmoDocs";
  import OmoDapps from "./quants/5-dapps/OmoDapps";
  import OnBoarding from "./quants/5-dapps/OnBoarding";
  import Odentity from "./quants/5-dapps/oDentity";
  import OmoDreams from "./quants/5-dapps/OmoDreams";
  import OmoOrgas from "./quants/5-dapps/OmoOrgas";
  import OmoSafe from "./quants/5-dapps/OmoSafe";
  import OmoAuth from "./quants/5-dapps/OmoAuth";
  import OmoFunding from "./quants/5-dapps/OmoFunding";
  import OmoConnectCircles from "./quants/5-dapps/OmoConnectCircles.svelte";
  import OmoChat from "./quants/5-dapps/OmoChat.svelte";
  import OmoDreamChat from "./quants/5-dapps/OmoDreamChat.svelte";
  import OmoActions from "./quants/5-dapps/OmoActions.svelte";
  import OmoMarket from "./quants/5-dapps/OmoMarket.svelte";
  import OmoVoting from "./quants/5-dapps/OmoVoting.svelte";
  import OmoPreOrders from "./quants/5-dapps/OmoPreOrders.svelte";

  import OmoNavTop from "./quants/2-molecules/OmoNavTop.svelte";
  import OmoNavBottom from "./quants/2-molecules/OmoNavBottom.svelte";
  import { StartFlow } from "./events/omo/shell/startFlow";
  import { Navigated } from "./events/omo/shell/navigated";
  import { Logout } from "./events/omo/shell/logout";
  import { ClosePopup } from "./events/omo/shell/closePopup";
  import { ClearDatabase } from "./events/omo/shell/clearDatabase";

  let subscription = null;
  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
  onMount(() => {
    let route = getRoute();
    if (route.startsWith("?page")) curRoute.set(route);
    // if (!history.state) {
    //   window.history.replaceState(
    //     { path: window.location.pathname },
    //     "",
    //     window.location.href
    //   );
    // }
    // o.store.odentity.currentOmo().then(o => {
    //   omo = o;
    // });
    window.navigate = navigate;
    if (route) {
      window.o.publishShellEventAsync(
        new Navigated(route.replace("?page=", ""))
      );
    }

    let notifications = window.o.eventBroker.tryGetTopic("omo", "shell");
    subscription = notifications.observable.subscribe((next) => {
      if (!next._$schemaId) return;

      switch (next._$schemaId) {
        case "events:omo.shell.notification":
          notify(next.data);
          break;
        case "events:omo.shell.navigate":
          navigate(next.data.page);
          break;
        case "events:omo.shell.navigated":
          navigated(next.data.page);
          break;
        case "events:omo.shell.logout":
          window.o.odentity.logout();
          window.o.publishShellEventAsync(new ClosePopup());
          break;
        case "events:omo.shell.clearDatabase":
          console.error("Oida, was machst Du DB leer Lan?");
          break;
        case "events:omo.shell.log":
          if (next.data.dataJson) {
            console.log(
              new Date().toJSON() +
                " | " +
                next.data.severity +
                " | " +
                next.data.source +
                " | " +
                next.data.message +
                " | " +
                next.data.dataJson
            );
          } else {
            console.log(
              new Date().toJSON() +
                " | " +
                next.data.severity +
                " | " +
                next.data.source +
                " | " +
                next.data.message
            );
          }
          break;
      }
    });
  });

  function notify(next) {}

  function navigated(page) {}

  function handlerBackNavigation(event) {
    curRoute.set(event.state.route);
  }

  // export const omo = window.o.odentity.current;
  //@todo listen to changes

  $: loggedIn = window.o.odentity.current != null;
  // ROUTING
  var routes = [
    { route: "/", quant: OmoHome, authenticate: false },
    { route: "?page=home", quant: OmoHome, authenticate: false },
    { route: "?page=mamaomo", quant: MamaOmo, authenticate: true },
    { route: "?page=omoauth", quant: OmoAuth, authenticate: false },
    { route: "?page=magicLogin", quant: MagicLogin, authenticate: false },
    {
      route: "?page=odentity",
      quant: Odentity,
      authenticate: false,
      actions: [
        // TODO: Custom actions should be available on every level
        // {
        //   title: "Remove Circles SeedPhrase Auth",
        //   event: () =>
        //     new StartFlow("flows:omo.odentity.removeAuthProviderSeedPhrase"),
        // },
        // {
        //   title: "Remove Email Auth Provider",
        //   event: () =>
        //     new StartFlow("flows:omo.odentity.removeAuthProviderMail"),
        // },
        // {
        //   title: "Remove owner Device",
        //   event: () => new StartFlow("flows:omo.odentity.removeOwnerDevice"),
        // },
        // {
        //   title: "Add Circles SeedPhrase Auth",
        //   event: () =>
        //     new StartFlow("flows:omo.odentity.addAuthProviderSeedPhrase"),
        // },
        // {
        //   title: "Add Email Auth Provider",
        //   event: () => new StartFlow("flows:omo.odentity.addAuthProviderMail"),
        // },
        // {
        //   title: "Add owner Device",
        //   event: () => new StartFlow("flows:omo.odentity.addOwnerDevice"),
        // },
        {
          title: "Logout",
          event: () => new Logout(),
        },
        // {
        //   title: "ClearDatabase",
        //   event: () => new ClearDatabase(),
        // },
      ],
    },
    { route: "?page=docs", quant: OmoDocs, authenticate: true },
    { route: "?page=omodapps", quant: OmoDapps, authenticate: true },
    {
      route: "?page=omodream",
      quant: OmoDream,
      authenticate: true,
      actions: [
        {
          title: "start campaign",
          event: () => new StartFlow("flows:omo.dreams.startCampaign"),
        },
        {
          title: "Invite someone",
          event: () => new StartFlow("flows:omo.dreams.inviteToDream"),
        },
      ],
    },
    { route: "?page=omofunding", quant: OmoFunding, authenticate: true },
    { route: "?page=omoorgas", quant: OmoOrgas, authenticate: true },
    {
      route: "?page=omomarket",
      quant: OmoMarket,
      authenticate: true,
      actions: [
        {
          title: "Create new dream",
          event: () => new StartFlow("flows:omo.dreams.createDream"),
        },
      ],
    },
    { route: "?page=omovoting", quant: OmoVoting, authenticate: true },
    { route: "?page=omopreorders", quant: OmoPreOrders, authenticate: true },
    {
      route: "?page=omosafe",
      quant: OmoSafe,
      authenticate: true,
      actions: [
        // TODO: Custom actions should be available on every level
        {
          title: "Trust someone",
          event: () => new StartFlow("flows:omo.safe.giveTrust"),
        },
        {
          title: "Remove trust",
          event: () => new StartFlow("flows:omo.safe.revokeTrust"),
        },
        {
          title: "Send Circles",
          event: () => new StartFlow("flows:omo.safe.transferCircles"),
        },
      ],
    },
    {
      route: "?page=omodreams",
      quant: OmoDreams,
      authenticate: true,
      actions: [
        {
          title: "Create new dream",
          event: () => new StartFlow("flows:omo.dreams.createDream"),
        },
      ],
    },
    {
      route: "?page=omochat",
      quant: OmoChat,
      authenticate: true,
      actions: [
        // {
        //   title: "Create new Chat Room",
        //   event: () => new StartFlow("flows:omo.chat.addChatRoom"),
        // },
        // {
        //   title: "Remove Chat Room",
        //   event: () => new StartFlow("flows:omo.chat.removeChatRoom"),
        // },
        {
          title: "Send Message",
          event: () => new StartFlow("flows:omo.chat.sendMessage"),
        },
      ],
    },
    {
      route: "?page=omodreamchat",
      quant: OmoDreamChat,
      authenticate: true,
      actions: [],
    },
    {
      route: "?page=onboarding",
      quant: OnBoarding,
      authenticate: false,
      actions: [
        {
          title: "Start onboarding",
          event: () => new StartFlow("flows:omo.odentity.createOmosapien"),
        },
      ],
    },
    { route: "?page=omodialog", quant: OmoDialog, authenticate: true },
    {
      route: "?page=omoactions",
      quant: OmoActions,
      authenticate: true,
    },
    {
      route: "?page=omoconnectcircles",
      quant: OmoConnectCircles,
      authenticate: true,
    },
  ];
  window.routes = routes; // TODO: Pfui!
</script>

<style>
  .app {
    height: 100vh;
    width: 100vw;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-areas: "'header', 'main', 'footer'";
    grid-template-columns: "1fr";
    grid-template-rows: 3rem 1fr 4rem;
  }

  .no-header-footer {
    grid-template-rows: 1fr 0px;
  }

  header {
    grid-area: "header";
  }

  main {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    grid-area: "main";
    overflow: hidden;
  }

  footer {
    grid-area: "footer";
  }
</style>

<svelte:window on:popstate={handlerBackNavigation} />

<div class="app" class:no-header-footer={!loggedIn}>
  {#if loggedIn}
    <header>
      <OmoNavTop />
    </header>
  {/if}
  <main>
    <svelte:component this={getComponent($curRoute, routes)} {routes} />
  </main>
  <footer>
    <OmoNavBottom />
  </footer>

  <!-- <footer>
      {#if omo != null}
        <OmoNavBottom />
      {:else if !$curRoute.startsWith('?page=omoauth')}
        <div class="flex flex-col justify-center bg-gray-200 h-12">
          <div class="p-4 text-center">
            <OmoButton data={login} />
          </div>
        </div>
      {/if}
    </footer> -->
</div>
