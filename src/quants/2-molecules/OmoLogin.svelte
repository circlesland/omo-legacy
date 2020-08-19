<script>
  import { mnemonicToEntropy, entropyToMnemonic } from "bip39";
  import ApolloClient, { gql } from "apollo-boost";
  import { query } from "svelte-apollo";
  import { getSafeAddressAsync } from "./../../queries/omo/safe/circles.svelte";
  import { StartFlow } from "../../events/omo/shell/startFlow";
  import { Omosapiens } from "../../queries/omo/odentity/omosapiens";

  const client = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/circlesubi/circles",
  });

  export let data = {
    welcome: "Welcome. Omo Sapiens.",
    image: "https://source.unsplash.com/random",
    magiclink: "magic login link has been send to your mail account",
    button: "Login with Email Link",
  };

  export let mail;

  function login() {
    loading = true;
    o.odentity.login(mail, "email", async (it) => {
      if (o.odentity.current == null) {
        loading = false;
        alert("something went wrong.");
      }
      console.log(it);
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("redirect")) {
        window.navigate(urlParams.get("redirect"), urlParams.get("data"));
        return;
      }

      if (o.odentity._current.circleSafe) {
        navigate("omomarket");
      } else {
        o.publishShellEventAsync(
          new StartFlow("flows:omo.odentity.createOmosapien")
        );
      }
      // navigate("omomarket");
    });
    o.quantRegistry.syncAllCollections();
  }

  function circlesLogin() {
    data.magiclink = "Your circles wallet will be connected to omo.earth";
    loading = true;
    o.odentity.login(seedPhrase, "circles", async (it) => {
      if (o.odentity.current == null) {
        loading = false;
        alert("something went wrong.");
      }

      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("redirect")) {
        o.quantRegistry.syncAllCollections();
        window.navigate(urlParams.get("redirect"), urlParams.get("data"));
        return;
      }

      try {
        const omosapien = await Omosapiens.byOdentityId(o.odentity.current._id);
        if (omosapien) {
          o.quantRegistry.syncAllCollections();
          navigate("omosafe");
          return;
        }
        o.publishShellEventAsync(
          new StartFlow("flows:omo.odentity.createOmosapienNameOnly")
        );
      } catch (e) {
        o.publishShellEventAsync(
          new StartFlow("flows:omo.odentity.createOmosapienNameOnly")
        );
      }
      o.quantRegistry.syncAllCollections();
      // navigate("omomarket");
    });
  }

  export let loading = false;

  export let seedPhrase = "";

  async function restoreFromSeed() {
    const restoredKey = mnemonicToEntropy(seedPhrase);
    const privateKey = `0x${restoredKey}`;
    /*
    const safeOwner = window.o.web3.eth.accounts.privateKeyToAccount(privateKey);
    localStorage.setItem("safeOwner", JSON.stringify(safeOwner));
    const safeAddress = await getSafeAddressAsync(safeOwner);
    localStorage.setItem("safe", JSON.stringify({safeAddress: safeAddress}));
     */
    navigate("omosafe");
  }

  async function createSeedPhrase(privateKeyString) {
    const mnemonic = entropyToMnemonic(privateKeyString);
    console.log("Mnemonic:", mnemonic);
  }
</script>

<div class="w-full flex flex-wrap">

  <div class="w-full md:w-1/2 flex flex-col">

    <div
      class="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0
      px-8 md:px-24 lg:px-32">

      {#if !loading}
        <h1 class="text-center text-4xl text-primary">
          Welcome.
          <br />
          Omo Sapiens.
        </h1>
        <form
          class="flex flex-col pt-3 md:pt-8"
          onsubmit="event.preventDefault();">
          <div class="flex flex-col pt-6">
            <input
              type="email"
              id="email"
              bind:value={mail}
              placeholder="your@mail.earth"
              class="appearance-none border rounded w-full py-4 px-6
              text-gray-700 text-xl mt-1 leading-tight focus:outline-none
              focus:shadow-outline" />
          </div>

          <button
            on:click={login}
            type="submit"
            value="Logger In"
            class="bg-primary rounded text-white font-bold text-lg
            hover:bg-secondary p-2">
            {data.button}
          </button>
        </form>

        <form
          class="flex flex-col pt-3 md:pt-8"
          onsubmit="event.preventDefault();">
          <div class="flex flex-col pt-6">
            <input
              type="text"
              id="text"
              bind:value={seedPhrase}
              placeholder="mnenomic seed phrase"
              class="appearance-none border rounded w-full py-4 px-6
              text-gray-700 text-xl mt-1 leading-tight focus:outline-none
              focus:shadow-outline" />
          </div>

          <button
            on:click={circlesLogin}
            type="submit"
            value="Logger In"
            class="bg-pink-700 rounded text-white font-bold text-lg
            hover:bg-secondary p-2">
            Login with Circles Seedphrase
          </button>
        </form>
      {:else}
        <h1 class="text-center text-2xl text-primary">{data.magiclink}</h1>
      {/if}

    </div>

  </div>

  <!-- Image Section -->
  <div class="w-1/2 ">
    <img
      class="object-cover w-full h-screen hidden md:block"
      src={data.image}
      alt={data.welcome} />
  </div>
</div>
