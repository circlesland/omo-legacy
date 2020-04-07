<script>
  export let omoheader = {
    title: "",
    subtitle: ""
  };
</script>

<div class="flex justify-center my-16">
  <div class="w-5/6 xl:w-4/6 text-center">
    <h2
      class="text-6xl text-green-400 mb-6"
      style="font-family: 'Permanent Marker', cursive !important;">
      {omoheader.title}
    </h2>
    <h3 class="text-xl">{omoheader.subtitle}</h3>
  </div>
</div>
