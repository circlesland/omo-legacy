<script>
  import OmoIconsFA from "./../1-atoms/OmoIconsFA.svelte";
  import Observable from "zen-observable";
  import moment from "moment";
  import { Rooms as RoomMutations } from "./../../mutations/omo/chat/rooms";
  import { Rooms as RoomQueries } from "./../../queries/omo/chat/rooms";
  import { Messages as MessageQueries } from "./../../queries/omo/chat/messages";
  import { Messages as MessageMutations } from "./../../mutations/omo/chat/messages";
  import { observe } from "svelte-observable";
  import { Omosapiens } from "../../queries/omo/odentity/omosapiens";
  import { loadingSafeDataAsync } from "../../queries/omo/safe/circles.svelte";

  export let data;
  let currentRoom = { _id: "" };

  async function init() {
    let result = await o.graphQL.query("ChatRooms{ _id dreamId}");
    currentRoom = result.data.ChatRooms.find(
      (x) => x.dreamId == data.dream._id
    );
    if (currentRoom == null) {
      var res = await o.graphQL.mutation(
        `addChatRoom(dreamId:"${data.dreamId}"){ _id,name,dreamId}`
      );
      currentRoom = res.data.addChatRoom;
    }
  }
  init();

  let newMessageText = "";
  $: messages = observe(MessageQueries.messagesByRoom(currentRoom._id));

  function sendNewMessage() {
    MessageMutations.sendMessage(currentRoom._id, newMessageText);
    newMessageText = "";
  }

  async function lookupName(odentityId) {
    const omosapien = await Omosapiens.byOdentityId(odentityId);
    if (!omosapien || omosapien.length === 0) return odentityId;
    else return omosapien.name;
  }
</script>

<style>
  .omo-layout {
    height: 100%;
    display: grid;
    grid-template-areas: "main" "bottom";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 3rem;
    overflow: hidden;
  }

  .main {
    grid-area: main;
    height: 100%;
    overflow-y: scroll;
  }

  .bottom {
    grid-area: bottom;
  }

  .active {
    @apply text-white bg-primary;
  }
</style>

<div class="omo-layout bg-gray-100">
  <!-- <OmoIconsFA /> -->
  {#if currentRoom._id != null}
    <div class="main p-8">
      <!-- <h1 class="text-center p-3 uppercase">
        {data.dream.name} onboarding chat
      </h1> -->
      {#if messages}
        {#await $messages}
          chat is loading
        {:then result}
          {#each result as message}
            <li
              class="flex flex-no-wrap items-center pr-3 text-black rounded-lg
              cursor-pointer mt-200 py-65 hover:bg-gray-200"
              style="padding-top: 0.65rem; padding-bottom: 0.65rem">
              <div class="flex justify-between w-full focus:outline-none">
                <div class="flex justify-between w-full">
                  <div
                    class="relative flex items-center justify-center w-12 h-12
                    ml-2 mr-3 text-xl font-semibold text-white bg-primary
                    rounded flex-no-shrink">
                    {#await lookupName(message.name) then name}
                      <img
                        class="object-cover w-12 h-12 rounded"
                        src="https://i.pravatar.cc/150?u={name}"
                        alt="" />
                    {/await}
                  </div>
                  <div class="items-center flex-1 min-w-0">
                    <div class="flex justify-between">
                      <h2 class="text-sm font-semibold text-black -mb-2">
                        {#await lookupName(message.name)}
                          Loading
                        {:then name}
                          {name}
                        {/await}
                      </h2>
                      <div class="flex">
                        <span class="ml-1 text-xs font-medium text-gray-600">
                          {moment
                            .unix(Number.isInteger(message.date) ? message.date / 1000 : message.date)
                            .locale('en')
                            .fromNow()}
                        </span>
                      </div>
                    </div>
                    <div
                      class="flex justify-between text-sm leading-none truncate">
                      <span>{message.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          {/each}
        {/await}
      {/if}
    </div>
    <div class="bottom">
      <div class="flex">
        <input
          bind:value={newMessageText}
          class="w-full p-3 border-t mr-0 border-b border-l text-gray-800
          border-gray-200 bg-white"
          placeholder="enter your chat message here" />

        <button
          on:click={() => sendNewMessage()}
          class="px-6 bg-primary hover:bg-secondary text-white font-bold p-3
          uppercase">
          Send
        </button>
      </div>
    </div>
  {:else}
    <div class="content-left">room is loading</div>
  {/if}
</div>
