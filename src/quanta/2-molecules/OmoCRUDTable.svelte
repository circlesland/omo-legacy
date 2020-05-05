<script>
  import OmoEntryRow from "./../1-atoms/OmoEntryRow.svelte";
  import { Database } from "@textile/threads-database";
  import OmoTable from "./../2-molecules/OmoTable.svelte";
  export let quantId;

  export let model = {
    quant: { name: "", ID: "", jsonSchema: "" },
    header: [],
    entries: [],
    properties: []
  };
  let collection;
  let properties;

  $: updateModel(quantId);

  function toValues(obj, properties) {
    return obj.map(item => {
      return Object.keys(properties).map(key => {
        return {
          value: item[key],
          key,
          type: properties[key].type
        };
      });
    });
  }

  async function updateModel(quantId) {
    await getAndUpdateProperties(quantId);

    let result = await graphql(
      `{${pluralize(model.quant.name)} {${Object.keys(model.properties).join(
        " "
      )}}}`
    );
    model.entries = toValues(
      result.data[pluralize(model.quant.name)],
      model.properties
    );
    console.log(model.entries);
    subscribe(
      `subscription {${pluralize(model.quant.name)} {${Object.keys(
        model.properties
      ).join(" ")}}}`
    ).then(subscription => {
      (async () => {
        for await (let value of subscription) {
          model.entries = toValues(
            value.data[pluralize(model.quant.name)],
            model.properties
          );
        }
      })();
    });
  }

  async function getAndUpdateProperties(quantId) {
    model.quant = (await graphql(
      `{QuantById(ID:"${quantId}"){ID name jsonSchema}}`
    )).data.QuantById;
    model.properties = JSON.parse(model.quant.jsonSchema).properties;
    model.header = Object.keys(model.properties).map(prop => {
      return { title: prop };
    });
    subscribe(
      `subscription {QuantById(ID:"${quantId}"){ID name jsonSchema}}`
    ).then(subscription => {
      (async () => {
        for await (let value of subscription) {
          model.properties = JSON.parse(value.QuantById.jsonSchema).properties;
          model.header = Object.keys(model.properties).map(prop => {
            return { title: prop };
          });
        }
      })();
    });
  }
</script>

<OmoTable header={model.header}>
  {#each model.entries as entry}
    <OmoEntryRow {entry} entryName={model.quant.name} />
  {/each}
</OmoTable>
<button
  class="rounded text-sm py-2 px-4 bg-green-400 font-bold text-white"
  on:click={async () => await window.graphql(`mutation { add${model.quant.name}(name:""){ID}}`)}>
  add {model.quant.name}
</button>
