<script>
  import OmoCardPreOrder from "../2-molecules/OmoCardPreOrder.svelte";
  import { onMount } from "svelte";
  import mocker from "mocker-data-generator";

  let omopreorders = [];

  const preorder = {
    name: {
      faker: "commerce.product",
      unique: true
    },
    createdAt: {
      faker: "date.past"
    },
    price: {
      faker: 'random.number({"min": 1, "max": 25})'
    },
    follower: {
      faker: 'random.number({"min": 144, "max": 1596})'
    },
    discount: {
      values: [50, 33, 20, 12.5, 7.69]
    },
    description: {
      faker: "random.words(12)"
    },
    city: {
      faker: "address.city"
    },
    group: {
      faker: "company.companyName"
    },
    image: {
      function: function() {
        return "https://source.unsplash.com/featured/?" + this.object.name;
      }
    }
  };

  mocker()
    .schema("preorder", preorder, 20)
    .build()
    .then(
      data => {
        omopreorders = data.preorder;
      },
      err => console.error(err)
    );
</script>

<style>
  section {
    @apply grid gap-10 mx-auto;
  }
</style>

<div class="overflow-y-scroll">

  <section
    class="px-4 py-4 md:p-16 lg:py-20 lg:px-32 grid-cols-1 md:grid-cols-2
    lg:grid-cols-3">
    {#each omopreorders as data, i (data.id)}
      <OmoCardPreOrder {data} />
    {/each}
  </section>

</div>
