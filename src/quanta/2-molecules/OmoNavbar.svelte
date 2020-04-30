<script>
  import { curRoute } from "./../../router.ts";
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";
</script>

<OmoIconsFA />

<div class="pb-0 w-full flex flex-wrap">
  <div class="p-3 w-full text-gray-500 bg-gray-900 shadow-lg ">
    <button on:click={() => curRoute.set('?route=home')}>
      <span class="pl-1 pr-3 mr-2 border-r border-gray-800">
        <img
          src="/images/logo.png"
          alt="alt placeholder"
          class="h-8 -my-1 inline mx-auto" />
      </span>
    </button>
    <button on:click={() => curRoute.set('?route=home')}>
      <span
        class="px-1 hover:text-white cursor-pointer uppercase text-sm font-bold">
        <!-- <i class="fas fa-home p-2 bg-gray-800 rounded" /> -->
        Home
      </span>
    </button>
    <button on:click={() => curRoute.set('?route=books')}>
      <span
        class="px-1 hover:text-white cursor-pointer uppercase text-sm font-bold">
        <!-- <i class="fas fa-home p-2 bg-gray-800 rounded" /> -->
        Editor
      </span>
    </button>
    <button on:click={() => curRoute.set('?route=test')}>
      <span
        class="px-1 hover:text-white cursor-pointer uppercase text-sm font-bold">
        <!-- <i class="fas fa-home p-2 bg-gray-800 rounded" /> -->
        Test
      </span>
    </button>
    <!-- <a href="/editor">
      <span
        class="px-1 hover:text-white cursor-pointer uppercase text-sm font-bold">
       <i class="fas fa-edit p-2 bg-gray-800 rounded" />
        Editor
      </span>
    </a> -->
    <!-- <span class="px-1 hover:text-white cursor-pointer">
      <i class="fas fa-search p-2 bg-gray-800 rounded" />
    </span> -->

    <!-- <a href="/">
      <span class="px-1 hover:text-white cursor-pointer">
        <i class="fas fa-th p-2 bg-gray-800 rounded" />
        <span class="mx-1">Quanta</span>
      </span>
    </a> -->
    <!-- <a href="/editor">
      <span class="px-1 hover:text-white cursor-pointer">
        <i class="fas fa-th p-2 bg-gray-800 rounded" />
        <span class="mx-1">Editor</span>
      </span>
    </a> -->
    <!-- <span class="px-1 hover:text-white cursor-pointer">
      <i class="w-8 fas fa-calendar-alt p-2 bg-gray-800 rounded" />
    </span>
    <span class="px-1 hover:text-white cursor-pointer">
      <i class="fas fa-user p-2 bg-gray-800 rounded" />
    </span>
    <span class="px-1 hover:text-white cursor-pointer w-8 relative">
      <i class="fas fa-bell p-2 bg-gray-800 rounded" />
      <span
        class="absolute right-0 top-0 -mt-2 -mr-1 text-xs bg-red-500 text-white
        font-medium px-2 shadow-lg rounded-full">
        3
      </span>
    </span> -->
    <!-- 
    <span class="cursor-pointer relative float-right">
      <img
        src="/images/samuel.jpg"
        alt="alt placeholder"
        class="h-8 inline mx-auto rounded border border-gray-600" />
    </span> -->
  </div>
</div>
