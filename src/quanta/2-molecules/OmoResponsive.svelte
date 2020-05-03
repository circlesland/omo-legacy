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
        colorbar: "w-full text-center text-white bg-pink-500 text-xs p-1",
        grid: "grid grid-cols-1 gap-1 p-1"
      },
      r1: {
        colorbar: "w-full text-center text-white bg-red-500 text-sm p-2",
        grid: "grid grid-cols-2 gap-2 p-2"
      },
      r2: {
        colorbar: "w-full text-center text-white bg-orange-400 text-md p-3",
        grid: "grid grid-cols-3 gap-2 p-2"
      },
      r3: {
        colorbar: "w-full text-center text-white bg-yellow-400 text-lg p-4",
        grid: "grid grid-cols-4 gap-4 p-4"
      },
      r4: {
        colorbar: "w-full text-center text-white bg-green-400 text-xl p-5",
        grid: "grid grid-cols-5 gap-4 p-4"
      },
      r5: {
        colorbar: "w-full text-center text-white bg-blue-400 text-2xl p-6",
        grid: "grid grid-cols-6 gap-4 p-4"
      }
    }
  };

  let design = {
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

  function responsive(node) {
    width = node.clientWidth;
    design = quant.design.base;
    if (width >= breakpoint.r1 && quant.design.r1) {
      design = quant.design.r1;
    }
    if (width >= breakpoint.r2 && quant.design.r2) {
      design = quant.design.r2;
    }
    if (width >= breakpoint.r3 && quant.design.r3) {
      design = quant.design.r3;
    }
    if (width >= breakpoint.r4 && quant.design.r4) {
      design = quant.design.r4;
    }
    if (width >= breakpoint.r5 && quant.design.r5) {
      design = quant.design.r5;
    }
  }
</script>

<div class="w-full" use:watchResize={responsive}>
  <div class={design.colorbar}>{width}px</div>
  <div class={design.grid}>
    {#each groups as quant}
      <OmoCardGroup {quant} />
    {/each}
  </div>
</div>
