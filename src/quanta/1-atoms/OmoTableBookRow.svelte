<script>
  import { Author } from "./../../schemas.ts";
  import Select from "svelte-select";

  export let book;
  export let bookname;
  export let authors;
  export let libraries;

  async function deleteBook() {
    if (confirm("are you sure?"))
      await graphql(`mutation {deleteBook(ID:"${book.ID}")}`);
  }

  async function selectValue(type) {
    switch (type) {
      case "bookname":
        book.name = bookname.label;
        await graphql(
          `mutation {saveBook(ID:"${book.ID}", name:"${book.name}"){ ID}}`
        );
        break;
      case "author":
        if (book.author.ID === undefined) return;
        if (book.author.ID === null) {
          book.author = (await graphql(
            `mutation {addAuthor(name:"${book.author.name}"){ ID name}}`
          )).data.addAuthor;
        }
        await graphql(
          `mutation {saveBook(ID:"${book.ID}", authorId:"${book.author.ID}"){ ID}}`
        );
        break;
      case "library":
        if (book.library.ID === undefined) return;
        if (book.library.ID === null) {
          book.library = (await graphql(
            `mutation {addLibrary(name:"${book.library.name}"){ ID name}}`
          )).data.addLibrary;
        }
        await graphql(
          `mutation {saveBook(ID:"${book.ID}", libraryId:"${book.library.ID}"){ ID}}`
        );
        break;
    }
  }

  async function clearValue(type) {
    switch (type) {
      case "bookname":
        await graphql(`mutation {saveBook(ID:"${book.ID}", name:"null"){ ID}}`);
        break;
      case "author":
        await graphql(
          `mutation {saveBook(ID:"${book.ID}", authorId:"null"){ ID}}`
        );
        break;
      case "library":
        await graphql(
          `mutation {saveBook(ID:"${book.ID}", libraryId:"null"){ ID}}`
        );
        break;
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

  <td class="">
    <Select
      isCreatable="true"
      bind:selectedValue={bookname}
      createItem={filterText => {
        return { label: filterText };
      }}
      getOptionLabel={option => option.label}
      getSelectionLabel={option => option.label}
      on:select={() => selectValue('bookname')}
      on:clear={() => clearValue('bookname', book)} />
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
  <td>
    <button
      on:click={deleteBook}
      class="text-sm bg-red-500 rounded text-white py-2 px-4">
      delete
    </button>
  </td>
</tr>
