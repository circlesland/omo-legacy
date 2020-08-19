<script>
  import OmoSpin from "./../1-atoms/OmoSpin"

  let subscription = null;
  let currentStep;
  export let data = {
    log: ""
  }
</script>

<div>
  <OmoSpin/>
  <div class="title">{currentStep}</div>
  <div class="collapsible" style="overflow: auto">
    {data.log}
  </div>
</div>
