<script>
  import OmoTable from "./../2-molecules/OmoTable.svelte";
  import OmoTableBookRow from "./../1-atoms/OmoTableBookRow.svelte";

  var model = {
    header: [
      // { title: "ID" },
      { title: "book" },
      { title: "author" },
      { title: "library" },
      { title: "actions" }
    ],
    books: [],
    libraries: [],
    authors: []
  };

  graphql("{books {ID name author {name} library {name}}}").then(
    result => (model.books = result.data.books)
  ),
    graphql("{authors {ID name}}").then(
      result => (model.authors = result.data.authors)
    ),
    graphql("{libraries {ID name }}").then(
      result => (model.libraries = result.data.libraries)
    ),
    subscribe(
      "subscription {books {ID name author {ID name} library {ID name}}}"
    ).then(subscription => {
      (async () => {
        for await (let value of subscription) {
          model.books = value.data.books;
          console.log("books subscription", model.books);
        }
      })();
    });
  subscribe("subscription {authors {ID name }}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        model.authors = value.data.authors;
      }
    })();
  });
  subscribe("subscription {libraries {ID name }}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        model.libraries = value.data.libraries;
      }
    })();
  });
</script>

<OmoTable header={model.header}>
  {#each model.books as book}
    <OmoTableBookRow
      bookname={book.name}
      {book}
      authors={model.authors}
      libraries={model.libraries} />
  {/each}
</OmoTable>
<button
  class="rounded text-sm py-2 px-4 bg-green-400 text-white"
  on:click={async () => await window.graphql('mutation { addBook(name:""){ID}}')}>
  add book
</button>
