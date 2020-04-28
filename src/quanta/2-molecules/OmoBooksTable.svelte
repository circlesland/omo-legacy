<script>
  import OmoTable from "./../2-molecules/OmoTable.svelte";
  import OmoTableRow from "./../1-atoms/OmoTableRow.svelte";
  import OmoTableTextColumn from "./../1-atoms/OmoTableTextColumn.svelte";
  import OmoTableActionColumn from "./../1-atoms/OmoTableActionColumn.svelte";

  import OmoTableRowBookAdd from "./../1-atoms/OmoTableRowBookAdd.svelte";

  var model = {
    header: [
      { title: "ID" },
      { title: "book" },
      { title: "author" },
      { title: "library" },
      { title: "actions" }
    ],
    books: []
  };

  subscribe("subscription {books {ID name author {name} library {name}}}").then(
    subscription => {
      (async () => {
        for await (let value of subscription) {
          model.books = value.data.books;
        }
      })();
    }
  );

  async function deleteBook(id) {
    if (confirm("Wirklich?"))
      await graphql(`mutation {deleteBook(ID:"${id}")}`);
  }
</script>

<OmoTable header={model.header}>
  {#each model.books as book}
    <!-- <tr class="accordion border-b border-grey-light hover:bg-gray-100"> -->
    <OmoTableRow>
      <OmoTableTextColumn text={book.ID} />
      <OmoTableTextColumn text={book.name} />
      <OmoTableTextColumn text={book.author} />
      <OmoTableTextColumn text={book.library} />
      <OmoTableActionColumn text="delete" action={() => deleteBook(book.ID)} />
    </OmoTableRow>
    <!-- </tr> -->
  {/each}
  <OmoTableRowBookAdd />
</OmoTable>
