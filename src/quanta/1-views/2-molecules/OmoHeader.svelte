<script>
  export let omoheader = {
    title: "",
    subtitle: "",
    illustration: ""
  };
</script>

<div class="flex justify-center my-20">
  <div class="w-5/6 xl:w-4/6 text-center">
    <h2
      class="text-6xl text-green-400 mb-6"
      style="font-family: 'Permanent Marker', cursive !important;">
      {omoheader.title}
    </h2>
    {#if omoheader.subtitle}
      <h3 class="text-xl text-gray-700">{omoheader.subtitle}</h3>
    {/if}
  </div>
</div>
