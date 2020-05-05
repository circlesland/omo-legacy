<script>
  import OmoFonts from "./../1-atoms/OmoFonts";
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

<div class="bg-white flex justify-center">
  <div class="flex content-start flex-wrap">
    {#each quant.data.steps as step, i}
      <div class="lg:w-1/3 p-6 m-auto content-center text-center">
        <img
          src={step.image}
          class="object-center m-auto px-10"
          style="height: 20rem"
          alt="image" />
        <div
          class="text-2xl text-center text-blue-800 my-2 flex flex-wrap
          justify-center content-center font-title uppercase font-bold"
          style="font-family: 'Montserrat', sans-serif !important;">
          {step.title}
        </div>
        <div class="text-gray-600">{step.description}</div>
      </div>
    {/each}
  </div>
</div>
