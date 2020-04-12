<script>
  export let omoheader = {
    title: "",
    subline: "",
    illustration: ""
  };
</script>

<div class="flex justify-center my-20">
  <div class="w-5/6 xl:w-4/6 text-center">
    <h2 class="text-5xl text-green-400 font-bold font-title uppercase">
      {omoheader.title}
    </h2>
    {#if omoheader.subline}
      <div
        class="text-3xl text-gray-500 italic font-light font-sans tracking-wide
        mb-6">
        {omoheader.subline}
      </div>
    {/if}
  </div>
</div>
