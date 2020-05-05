<script>
  let uuid = require("uuid");
  export let item = "";
  export let quant = {};
  async function addColumn() {
    let jsonSchema = JSON.parse(quant.jsonSchema);
    if (jsonSchema.properties.newColumn) return;
    jsonSchema.properties.newColumn = { type: "string" };

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
      await graphql(
        `mutation{saveQuant(ID:"${quant.ID}",jsonSchema:"""${JSON.stringify(
          jsonSchema
        )}""",collectionName:"${uuid.v4()}"){ID}}`
      );
    }
  }
</script>

<th class="px-2 py-1 text-xs">
  {item.value}
  <button
    on:click={addColumn}
    class="fas bg-gray-200 text-gray-700 p-3 fa-plus" />
</th>
