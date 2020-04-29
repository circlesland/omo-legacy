<script>
  import OmoTable from "./../2-molecules/OmoTable.svelte";
  import OmoTableLibraryRow from "./../1-atoms/OmoTableLibraryRow.svelte";

  var model = {
    header: [{ title: "library" }, { title: "books" }, { title: "actions" }],
    books: [],
    libraries: []
  };

  graphql("{books {ID name library {ID name}}}").then(result => {
    model.books = result.data.books;
  }),
    graphql("{libraries {ID name books{ID name}}}").then(
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
  subscribe("subscription {authors {ID name }}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        model.authors = value.data.authors;
      }
    })();
  });
  subscribe("subscription {libraries {ID name books{ID name}}}").then(
    subscription => {
      (async () => {
        for await (let value of subscription) {
          model.libraries = value.data.libraries;
        }
      })();
    }
  );
</script>

LIBS
<OmoTable header={model.header}>
  {#each model.libraries as library}
    <OmoTableLibraryRow
      libraryname={library.name}
      {library}
      books={model.books} />
  {/each}
</OmoTable>
<button
  class="rounded text-sm py-2 px-4 bg-green-400 text-white"
  on:click={async () => await window.graphql('mutation { addLibrary(name:""){ID}}')}>
  add library
</button>
