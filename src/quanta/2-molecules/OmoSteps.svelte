<script>
  export let quant = {
    data: {
      steps: [
        {
          image: "/images/city_girl.svg",
          title: "Step 1",
          description: "description step 1"
        },
        {
          image: "/images/order_a_car.svg",
          title: "Step 2",
          description: "description step 2"
        },
        {
          image: "/images/city_driver.svg",
          title: "Step 3",
          description: "description step 2"
        }
      ]
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
