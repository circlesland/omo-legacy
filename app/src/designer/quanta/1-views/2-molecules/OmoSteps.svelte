<script>
  export let quant = {
    id: "q3",
    component: OmoSteps,
    model: {
      id: "m3",
      name: "Omo Steps",
      image: "/images/samuel.jpg",
      author: "Samuel Andert",
      type: "view",
      group: "omo",
      tags: "molecule"
    },
    design: {},
    data: {
      id: "d3"
    }
  };
</script>

<div class="bg-white flex justify-center0">
  <div class="flex content-start flex-wrap">
    {#each quant.data.steps as step, i}
      <div class="w-1/3 px-6 content-center text-center">
        <img
          src={step.image}
          class="object-center px-10"
          style="height: 20rem"
          alt="image" />
        <div
          class="text-2xl text-center text-blue-800 mb-2 flex flex-wrap
          justify-center content-center font-title uppercase font-bold">
          {step.title}
        </div>
        <div class="text-gray-600">{step.description}</div>
      </div>
    {/each}
  </div>
</div>
