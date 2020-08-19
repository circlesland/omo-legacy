<script>
  export let actions = [];

  function click(action) {
    window.o.eventBroker.tryGetTopic("omo", "shell").publish(action);
  }
</script>

<style>
  section {
    max-height: 80vh;
    overflow-y: scroll;
  }
</style>

<section class="text-gray-700 bg-gray-200 w-full">
  {#each actions as action}
    <div
            on:click={() => click(action.event())}
            class="py-4 px-8 hover:bg-primary hover:text-white text-lg font-bold">
      {action.title}
      <div
              class="text-xs truncate w-full normal-case font-normal -mt-1
        text-gray-500">
        {#if action.description}{action.description}{/if}
      </div>
    </div>
  {/each}
</section>

<!--

<div
  class="flex content-end justify-center w-full flex-wrap bg-gray-100 h-full">
  <div class="text-gray-700 bg-gray-200 w-full lg:w-2/3">
    {#each actions as action}
      <div
        on:click={() => click(action.event())}
        class="py-4 px-8 hover:bg-primary hover:text-white">
        {action.title}
        <div
          class="text-xs truncate w-full normal-case font-normal -mt-1
          text-gray-500">
            {#if action.description}{action.description}{/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- <div class="h-full flex content-end flex-wrap w-full">
  <div class="flex justify-center w-full">
    {#each actions as action}
      <div class="flex flex-col items-center relative">
        <div class="w-full">
          <div class="cursor-pointer w-full lg:w-2/3 bg-gray-200">
            <div on:click={() => click(action.event())} class="py-2 px-4">
              Action title
              <div
                class="text-xs truncate w-full normal-case font-normal -mt-1
                text-gray-500">
                Action description
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div> -->

<!-- 
<div class="w-full md:w-1/2 mx-auto bg-red-300">

  <div class="flex flex-col w-full bg-gray-100">
    <div
      class="cursor-pointer w-full border-gray-100 rounded-t border-b
      hover:bg-primary">
      <div class="flex w-full items-center p-2 pl-2 ">
        <div class="w-full items-center flex">
          <div class="mx-2 -mt-1 ">
            Jack jhon
            <div
              class="text-xs truncate w-full normal-case font-normal -mt-1
              text-gray-500">
              CEO &amp; managin director
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> -->
<!-- 
<section>
  {#each actions as action}
    <div class="p-2 w-full md:w-4/5 lg:w-3/5 mx-auto">
      <div
        class="inline-flex items-center bg-gray-100 leading-none text-primary
        rounded p-1 shadow text-primary text-sm w-full">
        <a
          href="#"
          on:click={() => click(action.event())}
          class="inline-flex px-2">
          {action.name}
        </a>
      </div>
    </div>
  {/each}
</section> -->
