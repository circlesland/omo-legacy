<script>
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  import OmoFAQ from "./../2-molecules/OmoFAQ.svelte";

  export let omoheader = {
    title: "FAQ",
    subtitle: "subttile"
  };
</script>

<OmoHeader {omoheader} />
<OmoFAQ />
