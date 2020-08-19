<script>
  import {RequestSubmitFlowStep} from "../../events/omo/shell/requestSubmitFlowStep";

  export let data = {
    processNode: null,
    label: "Next"
  };
</script>

<style>
  section {
    height: 70vh;
  }
</style>

<div class="w-full">
  <form onsubmit="event.preventDefault();">
    <button
            class="w-full font-bold uppercase text-center bg-tertiary px-4 py-3
      text-white"
            type="submit"
            on:click={() => window.o.publishShellEventAsync(new RequestSubmitFlowStep(data.processNode.id))}>
      {data.label}
    </button>
  </form>
</div>
