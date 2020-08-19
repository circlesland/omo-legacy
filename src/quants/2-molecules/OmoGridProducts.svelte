<script>
  import OmoCardProduct from "../2-molecules/OmoCardProduct.svelte";
  import { onMount } from "svelte";
  import mocker from "mocker-data-generator";

  let omoproducts = [];

  const products = {
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
    .schema("products", products, 20)
    .build()
    .then(
      data => {
        omoproducts = data.products;
      },
      err => console.error(err)
    );
</script>

<div class="overflow-y-scroll">

  <section
    class="grid gap-10 mx-auto px-4 py-4 md:p-16 lg:py-20 lg:px-32 grid-cols-1
    md:grid-cols-2 lg:grid-cols-3">
    {#each omoproducts as data, i (data.id)}
      <OmoCardProduct {data} />
    {/each}
  </section>

</div>
