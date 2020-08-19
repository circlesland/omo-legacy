<script>
  import OmoSpin from "./../1-atoms/OmoSpin.svelte";
  import { Notification } from "./../../events/omo/shell/notification.ts";
  import moment from "moment";
  import OmoNavTabs from "./../2-molecules/OmoNavTabs";
  import { Omosapiens } from "../../queries/omo/odentity/omosapiens";
  import { observe } from "svelte-observable";

  //Tabs
  let currentTab;

  let tabItems = [
    { label: "Dashboard", value: 1, icon: "fa-home" },
    {
      label: "My Dreams",
      value: 2,
      icon: "fa-user-ninja",
    },
    // {
    //   label: "My Organisations",
    //   value: 3,
    //   icon: "fa-users"
    // },
    { label: "My Processes", value: 4, icon: "fa-tasks" },
    // { label: "Notifications", value: 5, icon: "fa-bell" },
    {
      label: "Safe Owners",
      value: 6,
      icon: "fa-user-shield",
    },
    {
      label: "My Backups",
      value: 7,
      icon: "fa-database",
    },
  ];

  let omosapiens = observe(
    Omosapiens.subscribeBySafeAddress(
      window.o.odentity.current.circleSafe.safeAddress
    )
  );
</script>

<style>
  section {
    display: grid;
    grid-template-areas: "'aside main'";
    grid-template-rows: 1fr;
    grid-template-columns: 20rem 1fr;
    @apply h-full;
    overflow: hidden;
  }

  aside {
    grid-area: "aside";
  }

  main {
    grid-area: "main";
  }
</style>

<section>
  <aside class="h-full overflow-y-scroll bg-gray-100">
    <OmoNavTabs bind:activeTabValue={currentTab} items={tabItems} />
  </aside>

  <main class="h-full w-full mt-12 md:w-5/6 mx-auto overflow-y-scroll">
    {#if 1 === currentTab}
      <h1 class="uppercase text-lg text-primary">
        WELCOME
        {#await $omosapiens}
          loading..
        {:then omosapiens}
          {#each omosapiens as omo}{omo.name}{/each}
        {/await}
      </h1>
      this is your omo sapiens profile, more profile options coming soon
      <br />
    {/if}

    {#if 2 === currentTab}
      <h1 class="uppercase text-lg text-primary mb-10">List of my dreams</h1>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-seedling text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">Dream 1</p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=12345678"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-seedling text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">dream 2</p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=12345678"
          class="h-full w-auto" />
      </div>
    {/if}
    {#if 3 === currentTab}
      <h1 class="uppercase text-lg text-primary mb-10">List of my Orgas</h1>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-users text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">Orga 1</p>

      </div>
    {/if}

    {#if 4 === currentTab}
      <h1 class="uppercase text-lg text-primary mb-10">My Processes</h1>
      <div>Active</div>
      <div>MOCKUP DEMO WIP</div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div
          class="h-12 w-12 py-2 px-4 text-xl bg-primary text-white font-bold">
          D
        </div>
        <p class="py-3 px-4 rounded w-full">Started new Dream</p>
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-red-400">
          <i class="fas fa-exclamation-triangle text-white" />
        </div>
        <p class="py-3 px-4 rounded w-full">
          Failed trusting 0xasddfh8273w8do7fgaisdlfo87lkjansdf
        </p>
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 px-3 h-12 w-12 text-center bg-gray-200">
          <OmoSpin />
        </div>
        <p class="py-3 px-2 rounded text-gray-500 w-full">
          Adding Owner Device
        </p>
      </div>
      <div>Done</div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-2 px-4 h-12 w-12 text-xl bg-tertiary font-bold">
          <i class="fas fa-check-circle text-white" />
        </div>
        <p class="py-3 px-4 rounded w-full">Transaction Successful</p>
      </div>
    {/if}

    {#if 5 === currentTab}
      <h1 class="uppercase text-lg text-primary">Notifications</h1>
    {/if}

    {#if 6 === currentTab}
      <h1 class="uppercase text-lg text-primary mb-10">
        List of Safe Owners which have access to my safe
      </h1>
      <div>MOCKUP DEMO WIP</div>

      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-mobile text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          Type: iphone, owner: Samuel, access-level: root
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=1234"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-laptop text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          Type: macbook, owner: Samuel, access-level: root
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=1234"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-mobile text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          Type: iphone, owner: Philipp, access-level: root
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=12345"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-laptop text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          Type: laptop, owner: mela, access-level: root
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=123456"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-google text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          Type: google-auth, owner: samuel, access-level: root
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=1234"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-at text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          Type: omo-auth (mail), owner: samuel, access-level: root
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=1234"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-seedling text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          Type: circles-seedphrase, owner: samuel, access-level: root
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=1234"
          class="h-full w-auto" />
      </div>
    {/if}
    {#if 7 === currentTab}
      <h1 class="uppercase text-lg text-primary mb-10">
        List of my data backups
      </h1>
      <div>MOCKUP DEMO WIP</div>
      Controlled by me
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-laptop text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">laptop 100% sync</p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=12345678"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-mobile text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">iphone 80% sync</p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=12345678"
          class="h-full w-auto" />
      </div>

      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-database text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">
          100% synchronised / filecoin / textile / powergate
        </p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=12345678"
          class="h-full w-auto" />
      </div>
      Controlled by others
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-database text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">Harddrive of mela</p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=1234234"
          class="h-full w-auto" />
      </div>
      <div
        class="flex h-12 mb-4 w-full bg-gray-200 text-gray-800 hover:bg-primary
        hover:text-white">
        <div class="py-3 w-12 h-12 text-center bg-primary">
          <i class="fas fa-database text-white" />
        </div>
        <p class="py-3 px-4 rounded flex-1">google drive</p>
        <img
          alt=""
          src="https://i.pravatar.cc/150?u=123434"
          class="h-full w-auto" />
      </div>
    {/if}
  </main>
</section>
