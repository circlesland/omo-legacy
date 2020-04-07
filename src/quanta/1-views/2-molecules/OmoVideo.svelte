<script>
  export let omovideo = {
    title: "video",
    link: ""
  };
</script>

<div class="flex justify-center">
  <div class="w-5/6 xl:w-4/6">
    <div
      class="embed-responsive aspect-ratio-16/9 rounded-lg omo-shadow omo-border
      ">
      <iframe
        class="embed-responsive-item"
        src={omovideo.link}
        title={omovideo.title} />
    </div>

  </div>
</div>
