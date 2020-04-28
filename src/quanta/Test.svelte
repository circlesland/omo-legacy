<script>
  window.subscribe("subscription {books {title}}").then(subscription => {
    (async () => {
      for await (let value of subscription) {
        console.log("ASYNC Value", value);
      }
    })();
  });
</script>

<div class="min-w-100">Test</div>
