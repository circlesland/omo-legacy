<script>
  import OmoDesignSystem from "./../3-organisms/OmoDesignSystem.svelte";
  import OmoBanner from "./../2-molecules/OmoBanner.svelte";
  import OmoCardProfile from "./../2-molecules/OmoCardProfile.svelte";
  import OmoAccordion from "./../2-molecules/OmoAccordion.svelte";
  import OmoCardUser from "./../2-molecules/OmoCardUser.svelte";
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoSteps from "./../2-molecules/OmoSteps.svelte";
  import OmoPricing from "./../2-molecules/OmoPricing.svelte";
  import OmoSubscribe from "./../2-molecules/OmoSubscribe.svelte";
  import OmoVideo from "./../2-molecules/OmoVideo.svelte";
</script>

<div class="w-full overflow-hidden overflow-y-auto">
  <OmoDesignSystem />
  <div id="content" class="p-16 m-auto">
    <OmoBanner />
    <OmoVideo />
    <OmoCardProfile />
    <OmoSteps />
    <OmoCardUser />
    <OmoHeader />
    <OmoPricing />
    <OmoAccordion />
    <OmoSubscribe />
  </div>
</div>
