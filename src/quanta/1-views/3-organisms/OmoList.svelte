<script>
  import { writable } from "svelte/store";
  import OmoItem from "./../2-molecules/OmoItem.svelte";
  import OmoInput from "./../2-molecules/OmoInput.svelte";
  import OmoButton from "./../1-atoms/OmoButton.svelte";

  export const meetups = writable([
    {
      id: "1",
      name: "Lets meet good old uncle Jakob"
    },
    {
      id: "2",
      name: "We want to play chess"
    }
  ]);

  let name = "new name";

  let button = {
    text: "add Item"
  };

  function addItem() {
    const newMeetup = {
      id: Math.random().toString(),
      name
    };
    meetups = [newMeetup, ...meetups];
  }
</script>

<form on:submit|preventDefault={addItem} class="w-full flex flex-wrap">
  <div class="w-1/2">
    <OmoInput value={name} id={name} type="text" />
  </div>
  <div class="w-1/2">
    <OmoButton type="submit" {...button} />
  </div>
</form>

<ul>
  {#each meetups as item, i (item.id)}
    <OmoItem {item} />
  {/each}
</ul>
