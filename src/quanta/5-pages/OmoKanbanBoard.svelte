<script>
  import OmoCardKanban from "./../2-molecules/OmoCardKanban";
  import { columns } from "./store";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 200),
    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
      };
    }
  });

  function createCard(columnIndex) {
    $columns[columnIndex].cards = [
      ...$columns[columnIndex].cards,
      {
        id: Math.random()
          .toString(36)
          .substring(2, 15),
        content: ""
      }
    ];
  }

  function addColumn() {
    $columns = [
      ...$columns,
      { id: $columns.length, name: "Placeholder", cards: [] }
    ];
  }

  function removeColumn() {
    if ($columns.length > 1) {
      $columns = $columns.slice(0, -1);
    }
  }

  function moveToNext(columnIndex, card) {
    $columns[columnIndex].cards = $columns[columnIndex].cards.filter(
      c => c.id !== card.id
    );
    if (columnIndex < $columns.length - 1) {
      $columns[columnIndex + 1].cards = [
        ...$columns[columnIndex + 1].cards,
        card
      ];
    }
  }
</script>

<style>
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    padding: 20px;
    line-height: 1;
    display: inline;
    font-size: 1em;
    vertical-align: middle;
  }

  .board {
    flex: 1;
    display: flex;
    padding: 20px;
    padding-top: 0;
    overflow-x: auto;
  }

  .column {
    display: flex;
    flex-direction: column;
    background-color: hsl(0, 0%, 97%);
    padding: 20px 0;
    min-width: 300px;
    width: 300px;
    margin-right: 5px;
    border-radius: 5px;
  }

  .col-title {
    display: flex;
    margin: 0 20px 1em;
  }

  .col-title .name {
    font-weight: bold;
    flex: 1;
  }

  .col-title .add {
    cursor: pointer;
    user-select: none;
  }

  .cards {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;
  }
</style>

<div class="app overflow-scroll ">
  <header>
    <button
      class="bg-green-200 p-2 text-blue-900 font-bold rounded"
      on:click={addColumn}>
      add board
    </button>
    <button
      class="bg-red-200 p-2 text-blue-800 font-bold rounded"
      on:click={removeColumn}>
      remove board
    </button>
  </header>
  <div class="board mr-6">
    {#each $columns as column, columnIndex}
      <div
        class="column"
        in:receive={{ key: columnIndex }}
        out:send={{ key: columnIndex }}>
        <div class="col-title">
          <div class="name">
            <span contenteditable bind:innerHTML={column.name} />
          </div>
          <div>
            <button class="add" on:click={() => createCard(columnIndex)}>
              Add Goal
            </button>
          </div>
        </div>
        <div class="cards">
          {#each column.cards as card (card.id)}
            <div
              animate:flip={{ duration: 200 }}
              in:receive={{ key: card.id }}
              out:send={{ key: card.id }}>
              <OmoCardKanban
                bind:content={card.content}
                on:next={() => moveToNext(columnIndex, card)} />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
