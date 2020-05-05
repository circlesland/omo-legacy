<script>
  import OmoEntryRow from "./../1-atoms/OmoEntryRow.svelte";
  import OmoTableBody from "./../1-atoms/OmoTableBody.svelte";
  import OmoHeaderColumn from "./../1-atoms/OmoHeaderColumn.svelte";
  import OmoEditableHeaderColumn from "./../1-atoms/OmoEditableHeaderColumn.svelte";
  import OmoTableHeader from "./../1-atoms/OmoTableHeader.svelte";
  import OmoTable from "./OmoTable.svelte";
  import Select from "svelte-select";

  let uuid = require("uuid");
  export let quantId;

  export let quant = {
    ID: "",
    name: "",
    jsonSchema: {},
    collectionName: ""
  };
  export let entries = [];
  export let properties = {};

  $: updateHeader(quantId);
  $: updateEntries(properties);
  $: updateCss(entries);

  function updateCss(entries) {
    var foo = "grid-template-areas:";
    Object.keys(properties).forEach(prop => {
      foo += getRow(prop);
    });
    foo += ";";
    gridTemplateVertical = foo;
  }

  async function updateHeader(id) {
    quant = (await graphql(
      `{QuantById(ID:"${id}"){ID, jsonSchema, name, collectionName}}`
    )).data.QuantById;
    properties = JSON.parse(quant.jsonSchema).properties;
    subscribe(
      `subscription {QuantById(ID:"${id}"){ID, jsonSchema, name, collectionName}}`
    ).then(async subscription => {
      for await (let value of subscription) {
        quant = value.data.QuantById;
        properties = JSON.parse(quant.jsonSchema).properties;
      }
    });
  }

  async function updateEntries(props) {
    if (quant.name && Object.keys(props).length > 0) {
      let result = await graphql(
        `{${pluralize(quant.name)} {${Object.keys(props).join(" ")}}}`
      );
      entries = toValues(result.data[pluralize(quant.name)], props);
      updateCss(enries);
      subscribe(
        `subscription {${pluralize(quant.name)} {${Object.keys(props).join(
          " "
        )}}}`
      ).then(subscription => {
        (async () => {
          for await (let value of subscription) {
            entries = toValues(value.data[pluralize(quant.name)], props);
          }
        })();
      });
    }
  }

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
  let vertical = true;
  let gridTemplateVertical = "";
  function getRow(prop) {
    var foo = `"key-${prop} type-${prop} action-${prop}`;
    for (var i = 0; i < entries.length; i++) foo += " ds" + i + "-" + prop;
    foo += `" `;
    return foo;
  }
</script>

<style>
  .grid {
    display: grid;
  }
</style>

<div class="grid" class:vertical style={gridTemplateVertical}>
  {#each Object.keys(properties) as key}
    <div class="p-1" style={`grid-area:key-${key}`}>
      <Select bind:selectedValue={key} />
    </div>
    <div class="p-1" style={`grid-area:type-${key}`}>
      <Select bind:selectedValue={properties[key].type} />
    </div>
    <div class="p-1" style={`grid-area:action-${key}`}>
      <button>action</button>
    </div>
  {/each}
  {#each entries as row, r}
    {#each row as column}
      <div class="p-1" style={`grid-area:ds${r}-${column.key}`}>
        <Select bind:selectedValue={column.value} />
      </div>
    {/each}
  {/each}
</div>

<!-- <OmoTable>
  <OmoTableHeader>
    {#each Object.keys(properties) as key}
      <OmoEditableHeaderColumn
        item={{ value: key, key: key, type: properties[key].type }}
        {quant} />
    {/each}
    <OmoHeaderColumn item={{ value: 'actions' }} {quant} />
  </OmoTableHeader>
  <OmoTableBody>
    {#each entries as entry}
      <OmoEntryRow {entry} entryName={quant.name} />
    {/each}
  </OmoTableBody>
</OmoTable> -->

<!-- <button
  class="rounded text-sm py-2 px-4 bg-green-400 font-bold text-white"
  on:click={async () => await window.graphql(`mutation { add${quant.name}(name:""){ID}}`)}>
  add {quant.name}
</button> -->
