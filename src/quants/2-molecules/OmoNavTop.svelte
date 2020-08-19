<script>
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";
  import OmoButton from "./../1-atoms/OmoButton.svelte";
  import OmoNotify from "./../2-molecules/OmoNotify";
  // export let home = "javascript:navigate('home')";
  let a = [
    {
      title: "Dreams",
      link: "javascript:navigate('omodreams')",
    },
    {
      title: "Voting",
      link: "javascript:navigate('omovoting')",
    },
    {
      title: "Pre-Order",
      link: "javascript:navigate('omopreorders')",
    },
    {
      title: "Shop",
      link: "javascript:navigate('omopreorders')",
    },
  ];
</script>

<OmoIconsFA />

<nav class="bg-dark">
  <div class="max-w-7xl mx-auto px-2">
    <div class="relative flex items-center justify-between h-12">
      <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
        <!-- Mobile menu button-->
        <button
          class="inline-flex items-center justify-center p-2 rounded-md
          text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none
          focus:bg-gray-700 focus:text-white transition duration-150 ease-in-out"
          aria-label="Main menu"
          aria-expanded="false">
          <!-- Icon when menu is closed. -->
          <!-- Menu open: "hidden", Menu closed: "block" -->
          <svg
            class="block h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- Icon when menu is open. -->
          <!-- Menu open: "block", Menu closed: "hidden" -->
          <svg
            class="hidden h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        class="flex-1 flex items-center justify-center sm:items-stretch
        sm:justify-start">
        <a href="javascript:location = '/'" class="flex-shrink-0">
          <img
            class="block lg:hidden h-8 w-auto"
            src="/logos/logo.png"
            alt="Omo logo" />
          <img
            class="hidden lg:block h-8 w-auto"
            src="logos/logo_with_name.png"
            alt="Omo logo" />
        </a>
        <div class="hidden sm:block sm:ml-6">
          <!-- <div class="flex">
            {#each a as a}
              <a
                href={a.link}
                class="uppercase ml-4 px-3 py-1 border-2 border-white rounded
                text-sm font-medium leading-5 text-gray-300 hover:text-white
                hover:bg-primary focus:outline-none focus:text-white
                focus:bg-primary transition duration-150 ease-in-out">
                {a.title}
              </a>
            {/each}
          </div> -->
        </div>
      </div>
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static
        sm:inset-auto sm:ml-6 sm:pr-0">
        <nav class="relative">
          <!-- <OmoNotify/> -->
        </nav>

        <!-- Profile  -->
        <!-- <div class="ml-3 relative">
          <a href="javascript:navigate('odentity')">
            <button
              class="flex text-sm border-2 border-white rounded ease-in-out"
              id="user-menu"
              aria-label="User menu"
              aria-haspopup="true">
              <img
                class="h-8 w-8 rounded"
                src="https://source.unsplash.com/collection/portrait"
                alt="" />
            </button>
          </a>
        </div> -->

      </div>
    </div>
  </div>

  <!--
    Mobile menu, toggle classes based on menu state.

    Menu open: "block", Menu closed: "hidden"
  -->
  <div class="hidden sm:hidden">
    <div class="px-2 pt-2 pb-3">
      {#each a as a}
        <a
          href={a.href}
          class="block px-3 py-2 rounded-md text-base font-medium text-white
          bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700
          transition duration-150 ease-in-out">
          {a.title}
        </a>
      {/each}
    </div>
  </div>
</nav>
