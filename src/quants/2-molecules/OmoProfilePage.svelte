<script>
  import OmoAvatarsGrouped from "./../2-molecules/OmoAvatarsGrouped";
  import OmoCirclesBalance from "./../2-molecules/OmoCirclesBalance";
  import { loadingSafeDataAsync } from "../../queries/omo/safe/circles.svelte";

  export let data = {
    dream: {},
  };

  // let safe = "";

  // let getSafe = async function () {
  //   let safeAddress = await data.dream.safeAddress;
  //   let safe = await { safeAddress: safeAddress };
  //   return await { safeAddress: safeAddress };
  // };

  // getSafe();
</script>

<section class="bg-gray-100 py-4 font-sans">
  <section class="relative py-16">
    <div class="container mx-auto px-20">
      <div
        class=" relative flex flex-col min-w-0 break-words bg-white w-full mb-6
        shadow-xl rounded-lg -mt-40">
        <div class="bg-gray-200 py-6">
          <OmoCirclesBalance
            data={{ safeAddress: data.safeAddress, safeData: data.safeData }} />
        </div>
        <!-- <div class="w-full px-6 bg-primary text-white">
          <div class="flex py-4 flex-wrap justify-center lg:pt-4 pt-8">
            <div class="mr-4 p-3 text-center">
              <span
                class="text-3xl font-bold block uppercase tracking-wide
                text-white">
                10
              </span>
              <span class="text-xs uppercase text-blue-400 font-bold">
                Dreamers
              </span>
            </div>
            <div class="mr-4 p-3 text-center">
              <span
                class="text-3xl font-bold block uppercase tracking-wide
                text-white">
                33
              </span>
              <span class="text-xs uppercase text-blue-400 font-bold">
                of 100% reached
              </span>
            </div>
            <div class="lg:mr-4 p-3 text-center">
              <span
                class="text-3xl font-bold block uppercase tracking-wide
                text-white">
                60
              </span>
              <span class="text-xs uppercase text-blue-400 font-bold">
                of Ø 91 / week goal
              </span>
            </div>
          </div>
        </div> -->
        <!--<OmoAvatarsGrouped data={dreamers}/>-->
        <div class="text-center mt-4">
          <h3 class="text-4xl font-semibold leading-normal mb-2 text-gray-800">
            {data.dream.name}
          </h3>
          <div
            class="text-sm leading-normal mt-0 mb-2 text-gray-500 font-bold
            uppercase">
            <i class="fas fa-map-marker-alt mr-2 text-lg text-gray-500" />
            {data.dream.city}
          </div>
        </div>
        <div class="mt-10 py-10 border-t border-gray-300 text-center">
          <div class="flex flex-wrap justify-center">
            <div class="w-full lg:w-9/12 px-4">
              <p class="text-lg leading-relaxed text-gray-800">
                {data.dream.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</section>
