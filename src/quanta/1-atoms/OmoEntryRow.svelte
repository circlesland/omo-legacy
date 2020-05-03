<script>
  import { Author } from "./../../schemas.ts";
  import Select from "svelte-select";
  export let entry;
  export let entryName;

  let types = ["string", "number"];
  async function deleteBook() {
    if (confirm("are you sure?"))
      await graphql(`mutation {delete${entryName}(ID:"${entry.ID}")}`);
  }

  async function selectValue(key) {
    let data = entry[key];
    debugger;
    if (data.value) {
      var foo = await graphql(
        `mutation {update${entryName}(ID:"${btoa(
          entry.find(x => x.key == "ID").value
        )}", ${data.key}:"${btoa(data.value)}"){ ID jsonSchema}}`
      );
      console.log(foo);
    }
  }

  async function clearValue(key) {
    await graphql(
      `mutation {update${entryName}(ID:"${
        entry.find(x => x.key == "ID").value
      }", ${data.key}:"null"){ ID}}`
    );
    //   switch (type) {
    //     case "bookname":
    //       await graphql(`mutation {saveBook(ID:"${book.ID}", name:"null"){ ID}}`);
    //       break;
    //     case "author":
    //       await graphql(
    //         `mutation {saveBook(ID:"${book.ID}", authorId:"null"){ ID}}`
    //       );
    //       break;
    //     case "library":
    //       await graphql(
    //         `mutation {saveBook(ID:"${book.ID}", libraryId:"null"){ ID}}`
    //       );
    //       break;
    //   }
  }

  // const createItem = filterText => {
  //   return { name: filterText, ID: null };
  // };

  // const optionIdentifier = "ID";
  // const getOptionLabel = (option, filterText) =>
  //   option.isCreator ? `Create "${filterText}"` : option.name;
  // const getSelectionLabel = option => option.name;
</script>

<tr class="w-full accordion border-b border-grey-light hover:bg-gray-100">
  {#each Object.keys(entry) as entrykey}
    <td>
      <!-- bind:selectedValue={entry[key]} -->
      <Select
        bind:selectedValue={entry[entrykey]}
        isCreatable={true}
        isDisabled={entry[entrykey].key == 'ID'}
        getSelectionLabel={option => option.value}
        getOptionLabel={(option, filterText) => (option.isCreator ? `Create "${filterText}"` : option.value)}
        createItem={(option, filterText) => {
          return { value: option, key: entry[entrykey].key, type: entry[entrykey].type, isCreator: true };
        }}
        on:clear={() => clearValue(entrykey)}
        on:select={() => selectValue(entrykey)} />

    </td>
  {/each}
  <!-- 
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
  </td>-->
  <td>
    <button
      on:click={deleteBook}
      class="text-sm bg-red-400 rounded-full font-bold text-white py-1 px-3">
      delete
    </button>
  </td>
</tr>
