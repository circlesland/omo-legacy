<script>
  import Select from "svelte-select";

  export let book;
  export let authors;
  export let libraries;

  async function deleteBook() {
    if (confirm("Wirklich?"))
      await graphql(`mutation {deleteBook(ID:"${book.ID}")}`);
  }

  async function selectValue(type) {
    switch (type) {
      case "name":
        break;
      case "author":
        debugger;
        if (book.author.value) {
          var author = (await graphql(
            `{mutation addAuthor(name: '${book.author.label}')}{name ID}`
          )).addAuthor;
          book.author = author;
        }
        console.log(book.author);
        break;
    }
  }

  const optionIdentifier = "ID";
  const getOptionLabel = option => option.name;
  const getSelectionLabel = option => option.name;
</script>

<tr class="w-full accordion border-b border-grey-light hover:bg-gray-100">
  <td class="py-2 px-4">{book.ID}</td>
  <td class="py-2 px-4">
    <input
      placeholder="name"
      bind:value={book.name}
      on:select={() => selectValue('name')}
      on:change={() => selectValue('name')} />
  </td>
  <td class="py-2 px-4">
    <Select
      isCreatable="true"
      createItem={filterText => {
        return { label: filterText, value: true };
      }}
      bind:selectedValue={book.author}
      on:select={() => selectValue('author')}
      items={authors}
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel} />
  </td>
  <td class="py-2 px-4">
    <Select
      isCreatable="true"
      createItem={filterText => {
        return { label: filterText, value: true };
      }}
      bind:selectedValue={book.library}
      on:select={() => selectValue('library')}
      items={libraries}
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel} />
  </td>
  <td>
    <button
      on:click={deleteBook}
      class="text-sm bg-orange-400 rounded text-white py-1 px-3">
      delete
    </button>
  </td>
</tr>
