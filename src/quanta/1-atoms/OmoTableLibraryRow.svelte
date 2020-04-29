<script>
  import { Author } from "./../../schemas.ts";
  import Select from "svelte-select";

  export let library;
  export let libraryname;
  export let books;

  async function deleteLibrary() {
    if (confirm("are you sure?"))
      await graphql(`mutation {deleteLibrary(ID:"${library.ID}")}`);
  }

  async function selectValue(type, event) {
    console.log(event);
    switch (type) {
      case "libraryname":
        library.name = libraryname.label;
        await graphql(
          `mutation {saveLibrary(ID:"${library.ID}", name:"${library.name}"){ ID}}`
        );
        break;
      case "books":
        if (library.books)
          library.books.forEach(async book => {
            await graphql(
              `mutation{saveBook(ID:"${book.ID}",libraryId:"${library.ID}"){ID}}`
            );
          });
        break;
    }
  }

  async function clearValue(type, cleared) {
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
      bind:selectedValue={libraryname}
      createItem={filterText => {
        return { label: filterText };
      }}
      getOptionLabel={option => option.label}
      getSelectionLabel={option => option.label}
      on:select={() => selectValue('libraryname')}
      on:clear={() => clearValue('libraryname')} />
  </td>
  <td class="">
    <div class="themed">
      <Select
        isCreatable="true"
        items={books}
        isMulti={true}
        bind:selectedValue={library.books}
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
      on:click={deleteLibrary}
      class="text-sm bg-red-500 rounded text-white py-2 px-4">
      delete
    </button>
  </td>
</tr>
