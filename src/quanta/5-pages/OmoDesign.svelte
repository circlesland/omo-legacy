<script>
  import OmoDesignSystem from "./../3-organisms/OmoDesignSystem.svelte";
  import OmoCardProfile from "./../2-molecules/OmoCardProfile.svelte";
  import OmoCardUser from "./../2-molecules/OmoCardUser.svelte";
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoPricing from "./../2-molecules/OmoPricing.svelte";
  import OmoSubscribe from "./../2-molecules/OmoSubscribe.svelte";
  import OmoVideo from "./../2-molecules/OmoVideo.svelte";
</script>

<div class="w-full overflow-hidden overflow-y-auto">
  <OmoDesignSystem />
  <div id="content" class="p-16 m-auto">
    <OmoVideo />
    <OmoCardProfile />
    <OmoCardUser />
    <OmoHeader />
    <OmoPricing />
    <OmoSubscribe />
  </div>
</div>
