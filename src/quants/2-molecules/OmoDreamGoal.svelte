<script>
  import OmoProfilePage from "./OmoProfilePage.svelte";
  import OmoVideo from "./OmoVideo.svelte";
  export let data;
</script>

<OmoVideo />
<OmoProfilePage {data} />
<!--
<button
  on:click={() => window.o.publishShellEventAsync(new StartFlow('flows:omo.dreams.inviteToDream', data.dream))}>
  INVITE
</button>
-->