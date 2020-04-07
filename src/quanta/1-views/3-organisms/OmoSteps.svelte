<script>
  import OmoHeader from "./../2-molecules/OmoHeader.svelte";
  export let omoheader = {
    title: "So gehts",
    subtitle: "ganz einfach in 3 Schritten"
  };
  export let omosteps = [
    {
      title: "Step 1",
      description: "description 1",
      image: ""
    },
    {
      title: "Step 2",
      description: "description 2",
      image: ""
    },
    {
      title: "Step 3",
      description: "description 3",
      image: ""
    }
  ];
</script>

<div class="bg-white flex justify-center pt-20 pb-40">
  <div class="w-5/6 xl:w-4/6">
    <OmoHeader {omoheader} />
    <div class="flex content-start flex-wrap">
      {#each omosteps as step}
        <div class="w-1/3 p-2">
          <a href="chat">
            <div class="text-center overflow-hidden ">
              <img
                src={step.image}
                class="px-16 py-8 object-cover object-center"
                alt="image" />
              <div
                class="text-4xl text-center text-blue-800 mb-2 flex flex-wrap
                justify-center content-center"
                style="font-family: 'Permanent Marker', cursive !important;">
                {step.title}
              </div>
              <div class="text-gray-600">{step.description}</div>
            </div>
          </a>
        </div>
      {/each}
    </div>
  </div>
</div>
