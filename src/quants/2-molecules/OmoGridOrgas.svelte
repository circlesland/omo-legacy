<script>
  import { onMount } from "svelte";
  import mocker from "mocker-data-generator";
  import OmoCardOrga from "./OmoCardOrga";

  $: orgas = [];

  onMount(async () => {
    mocker()
      .schema("orgas", schemaOrga, 15)
      .build()
      .then(data => {
        orgas = data.orgas;
      });
  });

  var schemaOrga = {
    name: {
      faker: "company.companyName"
    },
    city: {
      faker: "address.city"
    },
    image: {
      function: function() {
        return "https://source.unsplash.com/featured/" + this.object.city;
      }
    },
    description: {
      faker: "lorem.sentence"
    },
    type: {
      values: [
        "food",
        "movies",
        "art",
        "beverages",
        "games",
        "mobility",
        "design",
        "coding",
        "hardware",
        "bikes",
        "cars"
      ]
    }
  };
</script>

<div class="overflow-y-scroll">

  <section
    class="grid gap-10 mx-auto px-4 py-4 md:p-16 lg:py-20 lg:px-32 grid-cols-1
    md:grid-cols-2 lg:grid-cols-3">
    {#each orgas as data, i (data.id)}
      <OmoCardOrga {data} />
    {/each}
  </section>

</div>
