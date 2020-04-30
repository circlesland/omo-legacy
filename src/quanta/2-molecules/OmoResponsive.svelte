<script>
  import { watchResize } from "svelte-watch-resize";

  let width;

  let size = {
    r1: true,
    r2: false,
    r3: false,
    r4: false,
    r5: false,
    r6: false
  };

  function responsive(node) {
    width = node.clientWidth;
    if (width < 480) {
      size.r1 = true;
      size.r2 = false;
      size.r3 = false;
      size.r4 = false;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 480 && width < 768) {
      size.r1 = false;
      size.r2 = true;
      size.r3 = false;
      size.r4 = false;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 768 && width < 992) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = true;
      size.r4 = false;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 992 && width < 1280) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = false;
      size.r4 = true;
      size.r5 = false;
      size.r6 = false;
    }
    if (width >= 1280) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = false;
      size.r4 = false;
      size.r5 = true;
      size.r6 = false;
    }
    if (width >= 1600) {
      size.r1 = false;
      size.r2 = false;
      size.r3 = false;
      size.r4 = false;
      size.r5 = false;
      size.r6 = true;
    }
  }
</script>

<div class="w-full" use:watchResize={responsive}>

  {#if size.r1}
    <div class="bg-pink-400 w-full h-12 text-center text-white text-xl pt-2">
      {width}
    </div>
  {/if}
  {#if size.r2}
    <div class="bg-red-400 w-full h-12 text-center text-white text-xl pt-2">
      {width}
    </div>
  {/if}
  {#if size.r3}
    <div class="bg-orange-400 w-full h-12 text-center text-white text-xl pt-2">
      {width}
    </div>
  {/if}
  {#if size.r4}
    <div class="bg-yellow-500 w-full h-12 text-center text-white text-xl pt-2">
      {width}
    </div>
  {/if}
  {#if size.r5}
    <div class="bg-green-500 w-full h-12 text-center text-white text-xl pt-2">
      {width}
    </div>
  {/if}
  {#if size.r6}
    <div class="bg-blue-500 w-full h-12 text-center text-white text-xl pt-2">
      {width}
    </div>
  {/if}
</div>
<!-- 
<OmoResponsive>
  <div class="bg-yellow-400 w-full h-10" />
  <div class="bg-orange-500 w-full h-10" />
  <div class="bg-red-500 w-full h-10" />
  <div class="bg-pink-500 w-full h-10" />
  <div class="bg-green-500 w-full h-10" />
  <div class="bg-blue-500 w-full h-10" />
</OmoResponsive> -->
