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
    var foo = `"action-${prop} type-${prop} key-${prop}`;
    for (var i = 0; i < entries.length; i++) foo += " ds" + i + "-" + prop;
    foo += `" `;
    return foo;
  }
</script>

<style>
  .omo-grid {
    display: grid;
  }
  .select {
    --borderRadius: 0;
    --multiItemBorderRadius: 2px;
    --multiItemMargin: 8px 5px;
    --height: 2.5rem;
  }
  .back {
    --background: #ebeff5;
  }
</style>

<div class="flex">
  <div class="bg-gray-100 w-64 rounded border">
    <button class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <i class="fas p-3 text-green-400 fa-plus" style="background: #EBEFF5" />
        <div class="px-3 py-1 text-sm">Add new key</div>
      </div>
    </button>
  </div>
  <div class="bg-white rounded border ml-12">
    <button class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <i class="fas text-red-400 bg-gray-100 p-3 fa-trash-alt" />
      </div>
    </button>
  </div>
  <div class="bg-white rounded border">
    <button class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <i class="fas text-orange-400 bg-gray-100 p-3 fa-copy" />
      </div>
    </button>
  </div>
  <div class="bg-white rounded border mr-48">
    <button class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <i class="fas text-green-400 bg-gray-100 p-3 fa-plus" />
      </div>
    </button>
  </div>
  <div class="bg-white rounded border">
    <button class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <i class="fas text-red-400 bg-gray-100 p-3 fa-trash-alt" />
      </div>
    </button>
  </div>
  <div class="bg-white rounded border">
    <button class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <i class="fas text-orange-400 bg-gray-100 p-3 fa-copy" />
      </div>
    </button>
  </div>
  <div class="bg-white rounded border mr-48">
    <button class="flex justify-between items-center w-full">
      <div class="flex items-center">
        <i class="fas text-green-400 bg-gray-100 p-3 fa-plus" />
      </div>
    </button>
  </div>
</div>

<div
  class="omo-grid bg-gray-100 border-gray-300 border rounded"
  class:vertical
  style={gridTemplateVertical}>
  {#each Object.keys(properties) as key}
    <div class="" style={`grid-area:action-${key}`}>
      <i
        class="fas bg-gray-100 text-red-400 p-3 fa-trash-alt border
        border-color-gray-200" />
    </div>
    <div class="back select" style={`grid-area:type-${key}`}>
      <Select bind:selectedValue={properties[key].type} />
    </div>
    <div class="back select" style={`grid-area:key-${key}`}>
      <Select bind:selectedValue={key} />
    </div>
  {/each}

  {#each entries as row, r}
    {#each row as column}
      <div class="select max-w-xs" style={`grid-area:ds${r}-${column.key}`}>
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
