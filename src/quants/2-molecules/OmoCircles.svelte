<script>
  import OmoNavTabs from "./../2-molecules/OmoNavTabs";
  import moment from "moment";
  import { Omosapiens } from "../../queries/omo/odentity/omosapiens";

  //Tabs
  let currentTab;

  let trustSafeAddress;

  let tabItems = [
    {
      label: "My transactions",
      value: 1,
      icon: "fa-exchange-alt",
      category: "general",
    },
    // { label: "My streams", value: 2, icon: "fa-history" },
    { label: "Token", value: 3, icon: "fa-coins" },
    {
      label: "Trust I receive",
      value: 4,
      icon: "fa-user-astronaut",
      category: "general",
    },
    {
      label: "Trust I give",
      value: 5,
      icon: "fa-user-ninja",
      category: "general",
    },
    {
      label: "UBI Payouts",
      value: 6,
      icon: "fa-hand-holding-heart",
      category: "general",
    },
  ];

  export let data = {
    safeAddress: "",
    safeData: {},
    transferData: {},
  };

  Array.prototype.sum = function (prop) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
      total += parseInt(this[i][prop]);
    }
    return total;
  };

  function sumCircles(query) {
    var b = query.data.safes[0].balances;
    return b.sum("amount") / 1000000000000000000;
  }

  async function lookupName(safeAddress) {
    const omosapien = await Omosapiens.bySafeAddress(safeAddress);
    if (!omosapien || omosapien.length == 0) return safeAddress;
    else return omosapien.name;
  }
  let notshown = [
    "0xd4f7f5afed7e869c42648c1b8ab7c394e3b11ecd",
    "0xc1251f7a72b54d025338c4808b059699baa12472",
    "0xa12adca8f70b1f3899ec4685c809f28bce1986dc",
  ];
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
  <main class="h-full w-full md:w-5/6 mx-auto overflow-y-scroll">
    {#if 1 === currentTab}
      <div class="py-6 px-8 text-md mt-6">
        {#each data.transferData.data.notifications as item}
          {#if item.transfer.to != '0x812d4e73eb6b8200a62469ec3249fb02eac58c91' && item.transfer.from != '0x0000000000000000000000000000000000000000'}
            <div class="flex h-12 mb-4 w-full bg-gray-100 text-gray-700">
              {#if item.transfer.from == data.safeAddress}
                <img
                  alt=""
                  src="https://i.pravatar.cc/150?u={item.transfer.to}"
                  class="h-full w-auto" />
                <div class="text-sm py-2 px-4 flex-1">
                  <p>
                    {#await lookupName(item.transfer.to)}
                      Loading
                    {:then name}
                      {name}
                    {/await}

                  </p>
                  <p class="text-xs -mt-3 text-gray-600">
                    {moment.unix(item.time).locale('en').fromNow()}
                  </p>
                </div>
                <div class="h-12 py-1 px-3 text-2xl text-red-400">
                  {(item.transfer.amount / 1000000000000000000).toFixed(2)} Φ
                </div>
              {:else}
                <img
                  alt=""
                  src="https://i.pravatar.cc/150?u={item.transfer.from}"
                  class="h-full w-auto" />
                <div class="text-sm py-2 px-4 flex-1">
                  <p>
                    {#await lookupName(item.transfer.from)}
                      Loading
                    {:then name}
                      {name}
                    {/await}
                  </p>
                  <p class="text-xs -mt-3 text-gray-600">
                    {moment.unix(item.time).locale('en').fromNow()}
                  </p>
                </div>
                <div class="h-12 py-1 px-3 text-2xl text-green-400">
                  {(item.transfer.amount / 1000000000000000000).toFixed(2)} Φ
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {/if}
    {#if 2 === currentTab}My list of active streams{/if}

    {#if 3 === currentTab}
      <div class="py-6 px-8 text-md mt-6">
        {#each data.safeData.data.safes[0].balances as item}
          <div class="flex h-12 mb-4 w-full bg-gray-100">
            {#if item.token.owner.id == '0x0e22dfe2ff3d1734b69c099dd46632fa3ec16678'}
              <img alt="" src="/profiles/samuel.jpg" class="h-full w-auto" />
              <p class="py-3 px-4 rounded flex-1">Samuel Taler</p>
            {:else if item.token.owner.id == '0x206b9f90df961871c1da12c7fd6d7fd32d357d11'}
              <img alt="" src="/profiles/philipp.jpg" class="h-full w-auto" />
              <p class="py-3 px-4 rounded flex-1">Philipp Taler</p>
            {:else}
              <img
                alt=""
                src="https://i.pravatar.cc/150?u={item.token.owner.id}"
                class="h-full w-auto" />
              <p class="py-3 px-4 rounded flex-1">

                {#await lookupName(item.token.owner.id)}
                  Loading
                {:then name}
                  {name}
                {/await}

              </p>
            {/if}
            <div class="h-12 py-1 px-3 text-2xl text-blue-400">
              {(item.amount / 1000000000000000000).toFixed(2)} Φ
            </div>
          </div>
        {/each}
      </div>
    {/if}

    {#if 4 === currentTab}
      <div class="py-6 px-8 text-md mt-6">
        {#each data.safeData.data.safes[0].outgoing as item}
          {#if !notshown.some((x) => x == item.canSendTo.id)}
            <div class="flex h-12 mb-4 w-full bg-gray-100">
              <img
                alt=""
                src="https://i.pravatar.cc/150?u={item.canSendTo.id}"
                class="h-full w-auto" />
              <p class="py-3 px-4 flex-1 text-gray-700">
                {#await lookupName(item.canSendTo.id)}
                  Loading
                {:then name}
                  {name}
                {/await}
              </p>
              <div class="h-12 py-1 px-3 text-2xl text-blue-400">
                ({item.limitPercentage}%) {(item.limit / 1000000000000000000).toFixed(0)}
                Φ
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}

    {#if 5 === currentTab}
      <div class="py-6 px-8 text-md mt-6">
        {#each data.safeData.data.safes[0].incoming as item}
          <div class="flex h-12 mb-4 w-full bg-gray-100 text-gray-700">
            {#if item.user}
              <img
                alt=""
                src="https://i.pravatar.cc/150?u={item.user.id}"
                class="h-full w-auto" />
              <div class="py-3 px-4 rounded flex-1">
                {#await lookupName(item.user.id)}
                  Loading
                {:then name}
                  {name}
                {/await}

              </div>
              <div class="h-12 py-1 px-3 text-2xl text-blue-400">
                ({item.limitPercentage}%) {(item.limit / 1000000000000000000).toFixed(2)}
                Φ
              </div>
            {:else}
              <p class="py-3 px-4 rounded flex-1">User not activated</p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if 6 === currentTab}
      <div class="py-6 px-8 text-md mt-6">
        {#each data.transferData.data.notifications as item}
          {#if item.transfer.from === '0x0000000000000000000000000000000000000000'}
            <div
              class="flex h-12 mb-4 w-full bg-gray-100 rounded text-gray-700">
              <img
                alt="ubi payout"
                src="/logos/logo.png"
                class="h-full w-auto" />
              <div class="text-sm py-2 px-4 flex-1">
                <p>Universal basic income payout</p>
                <p class="text-xs -mt-3 text-gray-600">
                  {moment.unix(item.time).locale('en').fromNow()}
                </p>
              </div>
              <div class="h-12 py-1 px-3 text-2xl text-green-400">
                {(item.transfer.amount / 1000000000000000000).toFixed(2)} Φ
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </main>
</section>
