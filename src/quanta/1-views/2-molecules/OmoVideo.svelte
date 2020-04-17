<script>
  import { onMount } from "svelte";
  // All providers are named {ProviderName}Provider.
  import { Player, VimeoProvider } from "@vime-js/standard";

  let player;

  const providers = [VimeoProvider];

  onMount(() => {
    player.src = data.video_id;
  });

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
    link: "https://player.vimeo.com/video/349650067",
    video_id: "vimeo/349650067"
  };
</script>

<div class="bg-blue-900 w-full">
  <Player {providers} bind:this={player} />
</div>
