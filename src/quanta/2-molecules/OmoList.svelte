<script>
  import OmoListItem from "./../1-atoms/OmoListItem.svelte";
  const items = [
    {
      name: "Books",
      icon: "fa-book"
    },
    {
      name: "Authors",
      icon: "fa-user-graduate"
    },
    {
      name: "Libraries",
      icon: "fa-book-reader"
    }
  ];
</script>

<div class="p-4">
  {#each items as quant}
    <OmoListItem {quant} />
  {/each}
</div>
