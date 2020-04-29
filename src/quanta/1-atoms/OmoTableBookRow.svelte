<script>
  import { Author } from "./../../schemas.ts";
  import Select from "svelte-select";

  export let book;
  export let library;
  export let authors;
  export let libraries;

  async function deleteBook() {
    if (confirm("are you sure?"))
      await graphql(`mutation {deleteBook(ID:"${book.ID}")}`);
  }

  async function selectValue(type) {
    switch (type) {
      case "author":
        if (book.author.ID === undefined) return;
        if (book.author.ID === null) {
          book.author = (await graphql(
            `mutation {addAuthor(name:"${book.author.name}"){ ID name}}`
          )).data.addAuthor;
        }
        break;
      case "library":
        if (book.library.ID === undefined) return;
        if (book.library.ID === null) {
          book.library = (await graphql(
            `mutation {addLibrary(name:"${book.library.name}"){ ID name}}`
          )).data.addLibrary;
        }
        break;
    }
    await graphql(
      `mutation {saveBook(ID:"${book.ID}", name:"${book.name}",authorId:"${
        book.author ? book.author.ID : null
      }",libraryId:"${
        book.library ? book.library.ID : null
      }"){ ID name author{name ID} library{name ID}}}`
    );
  }

  async function clearValue(type) {
    switch (type) {
      case "author":
        await graphql(
          `mutation {saveBook(ID:"${book.ID}", name:"${
            book.name
          }",authorId:"null",libraryId:"${
            book.library ? book.library.ID : null
          }"){ ID name author{name ID} library{name ID}}}`
        );
      case "library":
        await graphql(
          `mutation {saveBook(ID:"${book.ID}", name:"${book.name}",authorId:"${
            book.author ? book.author.ID : null
          }",libraryId:"null}"){ ID name author{name ID} library{name ID}}}`
        );
    }
  }

  const createItem = filterText => {
    return { name: filterText, ID: null };
  };
  const optionIdentifier = "ID";
  const getOptionLabel = (option, filterText) =>
    option.isCreator ? `Create "${filterText}"` : option.name;
  const getSelectionLabel = option => option.name;
</script>

<tr class="w-full accordion border-b border-grey-light hover:bg-gray-100">
  <!-- <td class="">{book.ID}</td> -->
  <td class="">
    <input class="p-2 w-full" placeholder="name" bind:value={book.name} />
  </td>
  <td class="">
    <div class="themed">
      <Select
        isCreatable="true"
        items={authors}
        bind:selectedValue={book.author}
        {createItem}
        {optionIdentifier}
        {getOptionLabel}
        {getSelectionLabel}
        on:select={() => selectValue('author')}
        on:clear={() => clearValue('author')} />
    </div>
  </td>

  <!-- -->
  <!-- on:select={() => selectValue('author')} -->
  <td class="">
    <Select
      isCreatable="true"
      items={libraries}
      bind:selectedValue={book.library}
      {createItem}
      {optionIdentifier}
      {getOptionLabel}
      {getSelectionLabel}
      on:select={() => selectValue('library')}
      on:clear={() => clearValue('library')} />
  </td>
  <!-- on:select={() => selectValue('library')} -->
  <td>
    <button
      on:click={deleteBook}
      class="text-sm bg-red-500 rounded text-white py-2 px-4">
      delete
    </button>
  </td>
</tr>
