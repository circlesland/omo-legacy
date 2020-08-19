<script>
  import Actions, {nextStep} from "./../omo-actions/Actions";

  export let data = {
    step: 0,
    title: "",
    button: ""
  };

  var handleButton = function () {
    data = nextStep(step);
  };

  $: step = data.step;
  $: title = data.output;
  $: button = data.button;
</script>

<div class="w-full bg-gray-200">
  <form
          onsubmit="event.preventDefault();"
          class="flex justify-center text-center">
    <button
            on:click={() => handleButton()}
            type="submit"
            class="bg-primary hover:bg-secondary px-6 text-white font-bold p-3
      uppercase">
      {button}
    </button>
  </form>
</div>
