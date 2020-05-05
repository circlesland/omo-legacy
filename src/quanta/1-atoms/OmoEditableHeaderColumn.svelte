<script>
  import Select from "svelte-select";
  let uuid = require("uuid");
  export let item = {};
  export let quant = {};

  async function changeColumn() {
    if (item.key == item.value) return;
    var jsonSchema = JSON.parse(quant.jsonSchema);
    jsonSchema.properties[item.value] = jsonSchema.properties[item.key];
    delete jsonSchema.properties[item.key];
    debugger;
    if (quant.ID == "78a414b4-8557-4790-a863-9e75a89bfbd8") {
      var uid = uuid.v4();
      await db.newCollection(uid, jsonSchema);
      await graphql(
        `mutation{saveQuant(ID:"${quant.ID}",jsonSchema:"""${JSON.stringify(
          jsonSchema
        )}"""){ID}}`
      );
      db.collections["Quant"] = db.collections[uid];
      db.collections.delete(uid);
    } else {
      let ffff = await graphql(
        `mutation{saveQuant(ID:"${quant.ID}",jsonSchema:"""${JSON.stringify(
          jsonSchema
        )}""",collectionName:"${uuid.v4()}"){ID}}`
      );
      console.log(ffff);
    }
  }
</script>

<th class="px-2 py-1 text-xs">
  <Select
    bind:selectedValue={item}
    isCreatable={true}
    hideEmptyState={true}
    createItem={(option, filterText) => {
      return { value: option, key: item.key, type: item.type, isCreator: true };
    }}
    isDisabled={item.value == 'name' || item.value == 'ID'}
    getSelectionLabel={option => option.value}
    getOptionLabel={(option, filterText) => JSON.stringify(option)}
    on:select={changeColumn} />
</th>
