<script>
  import OmoTable from "./../2-molecules/OmoTable.svelte";
  import OmoTableAuthorRow from "./../1-atoms/OmoTableAuthorRow.svelte";

  var model = {
    header: [{ title: "name" }, { title: "books" }, { title: "actions" }],
    books: [],
    libraries: [],
    authors: []
  };

  graphql("{books {ID name }}").then(
    result => (model.books = result.data.books)
  ),
    graphql("{authors {ID name books {ID name}} }").then(
      result => (model.authors = result.data.authors)
    ),
    graphql("{libraries {ID name }}").then(
      result => (model.libraries = result.data.libraries)
    ),
    subscribe("subscription {books {ID name }}").then(subscription => {
      (async () => {
        for await (let value of subscription) {
          model.books = value.data.books;
          console.log("books subscription", model.books);
        }
      })();
    });
  subscribe("subscription {authors {ID name books {ID name}} }").then(
    subscription => {
      (async () => {
        for await (let value of subscription) {
          model.authors = value.data.authors;
        }
      })();
    }
  );
  subscribe("subscription {libraries {ID name }}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        model.libraries = value.data.libraries;
      }
    })();
  });
</script>

<OmoTable header={model.header}>
  {#each model.authors as author}
    <OmoTableAuthorRow
      authorname={author.name}
      {author}
      books={model.books}
      libraries={model.libraries} />
  {/each}
</OmoTable>
<button
  class="rounded text-sm py-2 px-4 bg-green-400 font-bold text-white"
  on:click={async () => await window.graphql('mutation { addAuthor(name:""){ID}}')}>
  add author
</button>
