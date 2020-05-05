<script>
  import OmoTableHeader from "./../1-atoms/OmoTableHeader.svelte";
  export let header = [];
</script>

<table class="w-full border">
  <slot />
</table>
