<script>
  export const model = {
    name: "Omo Video",
    author: "Samuel Andert",
    image: "/image/samuel.jpg",
    type: "omo/views/molecules"
  };
  export const design = {};
  export const data = {
    id: "",
    title: "video",
    link: "https://player.vimeo.com/video/349650067"
  };
</script>

<div class="bg-blue-800 w-full flex justify-center rounded-lg">
  <div class="w-full">
    <div
      class="embed-responsive aspect-ratio-16/9 rounded-lg omo-shadow omo-border">
      <iframe
        class="embed-responsive-item "
        src={data.link}
        title={data.title} />
    </div>
  </div>
</div>
