<script>
  export let data = [];
</script>

<div class="flex overflow-hidden p-8 bg-gray-200 pl-16">
  {#each data as dreamer}
    <img
            alt=""
            class="inline-block border-white border-4 -ml-3 h-20 w-20 rounded-full
      text-white shadow-solid"
            src={dreamer.profile}/>
  {/each}
</div>
