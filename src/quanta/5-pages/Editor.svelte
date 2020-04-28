<script>
  import OmoTable from "./../2-molecules/OmoTable.svelte";
  import OmoTableRow from "./../2-molecules/OmoTableRow.svelte";

  var header = [
    { title: "ID" },
    { title: "book" },
    { title: "author" },
    { title: "library" }
  ];

  var books = [];
  window
    .subscribe("subscription {books {ID name author {name} library {name}}}")
    .then(subscription => {
      (async () => {
        for await (let value of subscription) {
          books = value.data.books;
        }
      })();
    });
</script>

<OmoTable {header}>
  {#each books as row}
    <OmoTableRow {row} />
  {/each}
</OmoTable>
