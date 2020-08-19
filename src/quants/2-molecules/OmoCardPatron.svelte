<script>
  export let data = {};
</script>

{#if data.coupon != null}
  <div class="max-w-sm bg-white shadow-lg rounded-lg overflow-hidden my-4">
    <span
            class="font-title w-full text-center text-sm font-bold inline-block p-2
      uppercase text-white bg-leap4">
      {data.follower} / 50
    </span>
    <div class="relative">
      <div class="overflow-hidden h-3 text-xs flex bg-dark">
        <div
                style="width: {(data.follower * 100) / 50}%"
                class="shadow-none flex flex-col text-center whitespace-nowrap
          text-white justify-center bg-tertiary"/>
      </div>
    </div>

    <div
            class="font-title bg-primary flex flex-col justify-center items-center
      text-3xl text-white h-32">
      Ø {data.coupon.value}
    </div>
    <div class="w-full flex items-center px-6 py-3 bg-dark">
      <div
              class="w-full flex justify-between font-title text-white font-semibold
        text-lg">
        <span>
          {(data.coupon.value - (data.coupon.value / 100) * data.coupon.discount).toFixed(2)}€
        </span>
        <span class="text-red-500">
          -{data.coupon.discount}%
          <span class="px-1 line-through">{data.coupon.value.toFixed(0)}€</span>
        </span>
      </div>
    </div>
    <div class="py-4 px-6">
      <h1 class="text-2xl font-semibold text-leap4">{data.name}</h1>
      <p class="py-2 text-lg text-gray-700 h-32">{data.description}</p>
    </div>
    <div class="font-title flex justify-between w-full">
      <a
              href="javascript:navigate('omodream')"
              class="w-full text-center text-white bg-tertiary font-bold text-lg px-4
        py-2 uppercase hover:bg-secondary">
        buy voucher now
      </a>
    </div>
  </div>
{/if}
