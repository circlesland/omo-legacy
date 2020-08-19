<script>
  export let data = {
    safeAddress: "",
  };

  Array.prototype.sum = function (prop) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
      total += parseInt(this[i][prop]);
    }
    return total;
  };

  function sumCircles(query) {
    var b = query.data.safes[0].balances;
    return b.sum("amount") / 1000000000000000000;
  }
</script>

<section class="flex justify-center flex-col text-center bg-gray-200">
  <div class="">
    <h1 class="text-primary text-6xl">
      {sumCircles(data.safeData).toFixed(2)}Φ
    </h1>
    <span class="text-center text-gray-500">
      gnosis safe address: {data.safeData.data.safes[0].id}
    </span>
  </div>
</section>
