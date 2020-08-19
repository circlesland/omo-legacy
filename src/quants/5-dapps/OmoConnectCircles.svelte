<script>
  import {mnemonicToEntropy} from "bip39";
  import {getSafeAddressAsync} from "./../../queries/omo/safe/circles.svelte";

  let seedPhrase = "";

  async function connectWithSeed() {
    try {
      const restoredKey = mnemonicToEntropy(seedPhrase);
      const privateKey = `0x${restoredKey}`;
      const safeOwner = window.o.web3.eth.accounts.privateKeyToAccount(privateKey);
      const safeAddress = await getSafeAddressAsync(safeOwner);
      if (window.o.odentity.current) {
        window.o.odentity.connectCircleWallet(safeOwner, safeAddress);
        navigate("omosafe");
      } else {
        alert("not logged in");
      }
    } catch (e) {
      if (e.message == "Invalid mnemonic") alert("Seed phrase is invalid");
      else throw e;
    }
  }
</script>

<div class="w-full flex flex-wrap">

  <div
          class="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0
    px-8 md:px-24 lg:px-32">

    <form class="flex flex-col pt-3 md:pt-8" onsubmit="event.preventDefault();">
      <div class="flex flex-col pt-6">
        <input
                type="text"
                id="text"
                bind:value={seedPhrase}
                placeholder="mnenomic seed phrase"
                class="appearance-none border rounded w-full py-4 px-6 text-gray-700
          text-xl mt-1 leading-tight focus:outline-none focus:shadow-outline"/>
      </div>

      <button
              on:click={connectWithSeed}
              type="submit"
              value="Logger In"
              class="bg-pink-700 rounded text-white font-bold text-lg
        hover:bg-secondary p-2">
        Connect Circles Wallet
      </button>
    </form>

    <form class="flex flex-col pt-3 md:pt-8" onsubmit="event.preventDefault();">

      <button
              on:click={() => alert('to be implemented')}
              type="submit"
              value="Logger In"
              class="bg-pink-700 rounded text-white font-bold text-lg
        hover:bg-secondary p-2">
        Create new Circles Wallet
      </button>
    </form>

  </div>

</div>
