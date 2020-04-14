<script>
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";
</script>

<OmoIconsFA />
<div class="pb-0 w-full flex flex-wrap">
  <div class="p-3 w-full text-gray-700 bg-gray-900 shadow-lg ">
    <a href="/home">
      <span class="pr-3 mr-2 border-r border-gray-800">
        <img
          src="/images/logo_single.png"
          alt="alt placeholder"
          class="h-8 -mt-1 inline mx-auto" />
      </span>
    </a>
    <!-- <a href="/">
      <span class="px-1 hover:text-white cursor-pointer">
        <i class="fas fa-stream p-2 bg-gray-800 rounded" />
      </span>
    </a>
    <span class="px-1 hover:text-white cursor-pointer">
      <i class="fas fa-search p-2 bg-gray-800 rounded" />
    </span> -->

    <a href="/quanta">
      <span class="px-1 hover:text-white cursor-pointer">
        <i class="fas fa-th p-2 bg-gray-800 rounded" />
        <span class="mx-1">Quanta</span>
      </span>
    </a>
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

    <span class="cursor-pointer relative float-right">
      <img
        src="/images/samuel.jpg"
        alt="alt placeholder"
        class="h-8 inline mx-auto rounded" />
    </span>
  </div>
</div>
