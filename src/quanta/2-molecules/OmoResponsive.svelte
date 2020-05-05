<script>
  import { watchResize } from "svelte-watch-resize";
  import OmoCardGroup from "./OmoCardGroup.svelte";

  let groups = [
    {
      name: "Group 1",
      follower: "123",
      description: "group description",
      image: "https://source.unsplash.com/random",
      user: "https://randomuser.me/api/portraits/women/21.jpg"
    },
    {
      name: "Group 2",
      follower: "63",
      description: "group description",
      image: "https://source.unsplash.com/random",
      user: "https://randomuser.me/api/portraits/women/21.jpg"
    },
    {
      name: "Group 3",
      follower: "346",
      description: "group description",
      image: "https://source.unsplash.com/random",
      user: "https://randomuser.me/api/portraits/women/21.jpg"
    },
    {
      name: "Group 4",
      follower: "10",
      description: "group description",
      image: "https://source.unsplash.com/random",
      user: "https://randomuser.me/api/portraits/women/21.jpg"
    },
    {
      name: "Group 5",
      follower: "123450",
      description: "group description",
      image: "https://source.unsplash.com/random",
      user: "https://randomuser.me/api/portraits/women/21.jpg"
    },
    {
      name: "Group 6",
      follower: "12340",
      description: "group description",
      image: "https://source.unsplash.com/random",
      user: "https://randomuser.me/api/portraits/women/21.jpg"
    }
  ];

  let quant = {
    design: {
      base: {
        colorbar: "w-full text-center font-bold uppercase text-primary-500",
        grid: "grid"
      },
      r0: {
        colorbar: "bg-blue-900 text-xs p-1",
        grid: "grid-cols-1 gap-1 p-1"
      },
      r1: {
        colorbar: "bg-red-500 text-sm p-2",
        grid: "grid-cols-2 gap-2 p-2"
      },
      r2: {
        colorbar: "bg-orange-400 text-md p-3",
        grid: "grid-cols-3 gap-2 p-2"
      },
      r3: {
        colorbar: "bg-yellow-400 text-lg p-4",
        grid: "grid-cols-4 gap-4 p-4"
      },
      r4: {
        colorbar: "bg-green-400 text-xl p-5",
        grid: "grid-cols-5 gap-4 p-4"
      },
      r5: {
        colorbar: "bg-blue-400 text-2xl p-6",
        grid: "grid-cols-6 gap-4 p-4"
      }
    }
  };

  let r = {
    colorbar: "",
    grid: ""
  };

  let width;

  let breakpoint = {
    r1: 480,
    r2: 768,
    r3: 992,
    r4: 1280,
    r5: 1600
  };

  function resize(node) {
    width = node.clientWidth;
    if (width < breakpoint.r1 && quant.design.r0) {
      r = quant.design.r0;
    }
    if (width >= breakpoint.r1 && width < breakpoint.r2 && quant.design.r1) {
      r = quant.design.r1;
    }
    if (width >= breakpoint.r2 && width < breakpoint.r3 && quant.design.r2) {
      r = quant.design.r2;
    }
    if (width >= breakpoint.r3 && width < breakpoint.r4 && quant.design.r3) {
      r = quant.design.r3;
    }
    if (width >= breakpoint.r4 && width < breakpoint.r5 && quant.design.r4) {
      r = quant.design.r4;
    }
    if (width >= breakpoint.r5 && width < breakpoint.r6 && quant.design.r5) {
      r = quant.design.r5;
    }
    if (width >= breakpoint.r6 && quant.design.r6) {
      r = quant.design.r6;
    }
  }
</script>

<div class="w-full h-full flex">
  <div class="bg-gray-800 h-full" style="width:500px" />
  <div class="flex-1">
    <div class="w-full" use:watchResize={resize}>
      <div class="{quant.design.base.colorbar} {r.colorbar}">{width}px</div>
      <div class="{quant.design.base.grid} {r.grid}">
        {#each groups as quant}
          <OmoCardGroup {quant} />
        {/each}
      </div>
    </div>
  </div>
</div>
