<script>
  export let db;
  export let currentId;
  import OmoThemeLight from "../../../design/Omo-Theme-Light.svelte";
  import OmoBlog from "../../../quants/Omo-Blog.svelte";
  import OmoCities from "../../../quants/Omo-Cities.svelte";
  import OmoHowTo from "../../../quants/Omo-HowTo.svelte";
  import OmoWelcome from "../../../quants/Omo-Welcome.svelte";
  import OmoDreams from "../../../quants/Omo-Dreams.svelte";
  import OmoEnkels from "../../../quants/Omo-Enkels.svelte";
</script>

<OmoWelcome />
<OmoHowTo />
<OmoDreams {db} {currentId} />
<OmoEnkels {db} {currentId} />
<OmoCities {db} {currentId} />
<OmoBlog {db} {currentId} />
