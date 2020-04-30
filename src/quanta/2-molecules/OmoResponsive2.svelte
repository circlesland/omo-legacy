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
  {width}
  {#if size.r1}
    <slot name="r1" />
    <div class="flex flex-col max-w-sm mx-auto rounded shadow">
      <img class="h-auto w-full object-cover" alt="image" />
      <h1 class="text-center text-blue-900 text-sm font-bold uppercase">
        sdsd
      </h1>
      <p class="text-gray-600 text-sm mt-1">sddsd</p>
    </div>
  {/if}
  {#if size.r2}
    <slot name="r2" />
  {/if}
  {#if size.r3}
    <slot name="r3" />
  {/if}
  {#if size.r4}
    <slot name="r4" />
  {/if}
  {#if size.r5}
    <slot name="r5" />
  {/if}
  {#if size.r6}
    <slot name="r6" />
  {/if}
</div>
