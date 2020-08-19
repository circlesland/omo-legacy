<script>
  async function acceptLogin() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("accept")) {
      var accept = urlParams.get("accept");
      await o.odentity.acceptLoginRequest(accept);
      window.close();
    }
  }

  acceptLogin();
</script>

MAGIC LOGIN
