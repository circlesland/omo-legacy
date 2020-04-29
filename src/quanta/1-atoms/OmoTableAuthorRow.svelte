<script>
  import { Author } from "./../../schemas.ts";
  import Select from "svelte-select";

  export let author;
  export let authorname;
  export let books;
  export let libraries;

  async function deleteAuthor() {
    if (confirm("are you sure?"))
      await graphql(`mutation {deleteAuthor(ID:"${author.ID}")}`);
  }

  async function selectValue(type, event) {
    console.log(event);
    switch (type) {
      case "authorname":
        author.name = authorname.label;
        await graphql(
          `mutation {saveAuthor(ID:"${author.ID}", name:"${author.name}"){ ID}}`
        );
        break;
      case "books":
        if (author.books)
          author.books.forEach(async book => {
            await graphql(
              `mutation{saveBook(ID:"${book.ID}",authorId:"${author.ID}"){ID}}`
            );
          });
        break;
    }
  }

  async function clearValue(type, cleared) {
    console.log("cleared", cleared);
    let todelete = cleared.detail;
    switch (type) {
      case "books":
        await graphql(
          `mutation {saveBook(ID:"${todelete.ID}",libraryId:"null"){ ID}}`
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
  <td class="">
    <Select
      isCreatable="true"
      bind:selectedValue={authorname}
      createItem={filterText => {
        return { label: filterText };
      }}
      getOptionLabel={option => option.label}
      getSelectionLabel={option => option.label}
      on:select={() => selectValue('authorname')}
      on:clear={() => clearValue('authorname')} />
  </td>
  <td class="">
    <div class="themed">
      <Select
        isCreatable="true"
        items={books}
        isMulti={true}
        bind:selectedValue={author.books}
        {createItem}
        {optionIdentifier}
        {getOptionLabel}
        {getSelectionLabel}
        on:select={event => selectValue('books', event)}
        on:clear={cleared => clearValue('books', cleared)} />
    </div>
  </td>
  <td>
    <button
      on:click={deleteAuthor}
      class="text-sm bg-red-500 rounded text-white py-2 px-4">
      delete
    </button>
  </td>
</tr>
