<script>

  import {SubmitFlowStep} from "../../events/omo/shell/submitFlowStep";
  import {Logger} from "../../core/Log/logger";
  import {onDestroy, onMount} from "svelte";

  let subscription = null;
  let value = "";

  export let data = {};

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  onMount(() => {
    let notifications = window.o.eventBroker.tryGetTopic("omo", "shell");
    subscription = notifications.observable.subscribe(event => {
      if (!event._$schemaId) return;

      switch (event._$schemaId) {
        case "events:omo.shell.requestSubmitFlowStep":
          if (!event.data.processNodeId === data.id) {
            return; // Not meant for our executing flow
          }
          submit()
          break;
      }
    });
  });

  function submit() {
    const submitEvent = new SubmitFlowStep(data.processNode.id, {});
    Logger.log(data.processNode.id + ":OmoInput", "Sending SubmitFlowStep(processNodeId: " + data.processNode.id + ", value: <see attachment>)", value);
    window.o.publishShellEventAsync(submitEvent);
  }
</script>

<style>
  .omo-layout {
    min-height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 3rem;
    grid-template-areas: "'top''bottom'";
  }

  .top {
    grid-area: "top";
  }

  .bottom {
    grid-area: "bottom";
  }
</style>

<div class="omo-layout bg-gray-200 ">
  <div class="flex flex-col justify-center">
    <div class="top">
      <div class="py-6 px-8 lg:px-20 text-center mx-auto">
        {data.slide.title}
      </div>
    </div>
  </div>
</div>

<!-- 
    <div class="bg-gray-200 py-6 px-8 text-md">
      {#each users as user}
        <div class="flex h-12 mb-4 w-full bg-gray-100">
          <img alt="" src={user.picture.medium} class="h-full w-auto" />
          <p class="py-3 px-4 rounded w-full">{user.email}</p>
        </div>
      {/each}
    </div> -->
