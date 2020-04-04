<script>
  export let db;
  export let currentId;
  //import OmoThemeDark from "./design/Omo-Theme-Dark.svelte";
  import OmoThemeLight from "../design/Omo-Theme-Light.svelte";
  import OmoBlog from "../quants/Omo-Blog.svelte";
  import OmoCities from "../quants/Omo-Cities.svelte";
  import OmoHowTo from "../quants/Omo-HowTo.svelte";
  import OmoHeader from "../quants/Omo-Header.svelte";
  import OmoDreams from "../quants/Omo-Dreams.svelte";
  import OmoCallToAction from "../quants/Omo-CallToAction.svelte";
  import OmoChat from "../quants/Omo-Chat.svelte";
  import OmoEnkels from "../quants/Omo-Enkels.svelte";
</script>

<OmoHeader {db} {currentId} />
<OmoHowTo />
<OmoDreams {db} {currentId} />
<!-- <OmoCallToAction {db} {currentId} /> -->
<OmoEnkels {db} {currentId} />
<OmoCities {db} {currentId} />
<OmoBlog {db} {currentId} />
