<script>
  import OmoCardVote from "../2-molecules/OmoCardVote.svelte";
  import { onMount } from "svelte";
  import mocker from "mocker-data-generator";

  let omovotes = [];

  const vote = {
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
      faker: 'random.number({"min": 13, "max": 143})'
    },
    discount: {
      values: [100, 90, 80, 70, 60]
    },
    description: {
      faker: "random.words(10)"
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

  onMount(async () => {
    mocker()
      .schema("vote", vote, 20)
      .build()
      .then(
        data => {
          omovotes = data.vote;
        },
        err => console.error(err)
      );
  });
</script>

<div class="overflow-y-scroll">

  <section
    class="grid gap-10 mx-auto px-4 py-4 md:p-16 lg:py-20 lg:px-32 grid-cols-1
    md:grid-cols-2 lg:grid-cols-3">
    {#each omovotes as data, i (data.id)}
      <OmoCardVote {data} />
    {/each}
  </section>

</div>
