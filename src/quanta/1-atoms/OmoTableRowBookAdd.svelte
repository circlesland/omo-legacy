<script>
  import AutoComplete from "simple-svelte-autocomplete";

  let books = [];
  graphql("{books{ID name}}").then(result => (books = result.data.books));

  subscribe("subscription {books {ID name}}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        books = value.data.books;
      }
    })();
  });

  let newBook = {
    name: "",
    authorName: "",
    bookName: "",
    book: {},
    author: {},
    library: {}
  };

  let authors = [];
  graphql("{authors{ID name}}").then(result => (authors = result.data.authors));

  let libraries = [];
  graphql("{libraries{ID name}}").then(
    result => (libraries = result.data.libraries)
  );

  subscribe("subscription {authors {ID name}}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        authors = value.data.authors;
      }
    })();
  });

  subscribe("subscription {libraries {ID name}}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        libraries = value.data.libraries;
      }
    })();
  });

  async function saveBook() {
    var book = await graphql(
      `mutation {addBook(name:"${newBook.name}", authorId:"${newBook.author.ID}", libraryId:"${newBook.library.ID}"){ ID}}`
      // `mutation {addBook(name:"${newBook.name}"){ ID}}`
    );
    newBook = {
      name: "",
      authorName: "",
      bookName: "",
      book: {},
      author: {},
      library: {}
    };
  }

  const handleKeyup = () => {
    if (event.code == "Enter") {
      saveBook();
    }
  };
</script>

<tr class="w-full accordion border-b border-grey-light hover:bg-gray-100">
  <td>add new book</td>
  <td>
    <input on:keyup|preventDefault={handleKeyup} bind:value={newBook.name} />
    s
  </td>
  <td>
    <AutoComplete
      items={authors}
      bind:selectedItem={newBook.author}
      bind:value={newBook.authorName}
      labelFieldName="name"
      valueFieldName="ID" />
  </td>
  <td>
    <AutoComplete
      items={libraries}
      bind:selectedItem={newBook.library}
      labelFieldName="name"
      valueFieldName="ID" />
  </td>
  <td>
    <button
      type="submit"
      on:click={saveBook}
      class="m-2 text-sm bg-gray-400 rounded text-white py-1 px-3">
      save book
    </button>
  </td>
</tr>
