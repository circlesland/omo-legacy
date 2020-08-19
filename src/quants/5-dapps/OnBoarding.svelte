<script>
  import OmoHero from "./../2-molecules/OmoHero.svelte";
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";

  export let data = [
    {
      title: "Odentity",
      level: 1,
      steps: [
        {
          title: "welcome",
          locked: false,
          step: 1
        },
        {
          title: "add name",
          locked: false,
          step: 2
        },
        {
          title: "add last name",
          locked: true,
          step: 3
        },
        {
          title: "add profile image",
          locked: true,
          step: 4
        }
      ]
    },
    {
      title: "Omo Auth",
      level: 2,
      steps: [
        {
          title: "OmoEarthAuth Email",
          locked: false,
          step: 1
        },
        {
          title: "Circles Wallet",
          locked: true,
          step: 2
        }
      ]
    }
  ];

  export let hero = {
    uptitle: "Welcome",
    title: "What is your name",
    subline:
            "I am here to assist you in growing your passions and building your dreamteams"
  };

  export let firstname = "";

  async function saveFirstname() {
    var omo = await store.odentity.currentOmo();
    omo.firstname = firstname;
    await o.odentity.updateOmo(omo);
  }
</script>

<style>
  .omo-layout {
    display: grid;
    grid-template-areas: "aside content-top" "aside content-center" "aside content-bottom";
    grid-template-columns: 24rem 1fr;
    grid-template-rows: 1rem 1fr 3rem;
    overflow: hidden;
  }

  .aside {
    grid-area: aside;
    overflow-y: scroll;
    @apply bg-gray-200;
  }

  .content-top {
    grid-area: content-top;
  }

  .content-center {
    grid-area: content-center;
  }

  .content-bottom {
    grid-area: content-bottom;
  }
</style>

<div class="omo-layout">
  <div class="aside">
    <div class="omo-left py-6 px-8 text-md">

      {#each data.sort((first, second) => {
      if (first.level < second.level) return -1;
      if (first.level > second.level) return 1;
      return 0;
      }) as level, i}
        <p class="uppercase text-md font-bold text-gray-600">
          {level.level}. {level.title}
        </p>
        {#each level.steps.sort((first, second) => {
        if (first.step < second.step) return -1;
        if (first.step > second.step) return 1;
        return 0;
        }) as step, i}
          {#if step.locked}
            <div
                    class="flex flex-col justify-center bg-gray-300 h-12 mb-4 w-full">
              <div class="text-center">
                <i class="fas fa-lock text-gray-500"/>
              </div>
            </div>
          {:else}
            <div class="flex h-12 mb-4 w-full bg-gray-100 hover:bg-secondary">
              <p class="py-2 px-4 text-xl font-bold text-primary">
                {step.step}
              </p>
              <p class="py-3 px-4 rounded w-full">{step.title}</p>
            </div>
          {/if}
        {/each}
      {/each}
    </div>
  </div>

  <div class="content-top">Progress</div>
  <div class="content-center">
    <div class="h-full flex flex-col justify-center">
      <div class="text-center">
        <OmoHero data={hero}/>
        <p class="text-gray-400 hover:text-secondary">skip</p>
      </div>
    </div>
  </div>
  <div class="content-bottom">
    <div class="flex">
      <input
              bind:value={firstname}
              class="w-full p-3 border-t mr-0 border-b border-l text-gray-800
        border-gray-200 bg-white"
              placeholder="placeholder"/>
      <button
              on:click={saveFirstname}
              class="px-6 bg-green-400 text-gray-800 font-bold p-3 uppercase ">
        save
      </button>
    </div>
  </div>
</div>
