<script>
  import mocker from "mocker-data-generator";

  var schemaOrga = {
    name: {
      faker: "company.companyName"
    },
    city: {
      faker: "address.city"
    },
    image: {
      function: function () {
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

  var schemaCountry = {
    name: {
      faker: "address.country"
    }
  };

  var schemaCity = {
    name: {
      faker: "address.city"
    }
  };

  var schemaIndustry = {
    name: {
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

  $: orgas = [];
  $: countries = [];
  $: cities = [];
  $: industries = [];

  mocker()
          .schema("orgas", schemaOrga, 15)
          .schema("countries", schemaCountry, 5)
          .schema("cities", schemaCity, 7)
          .schema("industries", schemaIndustry, 8)
          .build()
          .then(data => {
            orgas = data.orgas;
            countries = data.countries;
            cities = data.cities;
            industries = data.industries;
          });
</script>

<style>
  .omo-layout {
    display: grid;
    grid-template-columns: 1fr 14rem;
    grid-template-rows: 1fr;
    grid-template-areas: "content aside";
    overflow: hidden;
  }

  .aside {
    grid-area: aside;
    min-height: 100%;
    @apply bg-gray-200;
  }

  .content {
    grid-area: content;
    min-height: 100%;
  }

  .wrap {
    @apply p-10 grid gap-3;
  }
</style>

<section class="omo-layout ">
  <div class="content h-full overflow-y-scroll">

    <div class="wrap grid-cols-2 md:grid-cols-4 ">
      {#each orgas as orga}
        <div
                class="container mx-auto max-w-sm overflow-hidden shadow-lg my-2
          bg-white">
          <div class="text-xs text-center bg-gray-300 text-primary">
            {orga.type}
          </div>
          <div
                  class="relative z-10"
                  style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% -
            5vw));">
            <div
                    class="z-0 relative group h-48 w-full flex justify-center
              items-center">
              <div
                      class="h-full w-full absolute bg-cover z-10 bg-center "
                      style="background-image: url('{orga.image}')"/>
              <p
                      class="w-full h-full bg-primary opacity-50 text-center pt-8
                font-bold text-xl text-white absolute z-20 pointer-events-none
                uppercase">
                {orga.city}
              </p>
            </div>
          </div>
          <div
                  class="h-12 flex justify-between items-center flex-row px-6 z-50
            -mt-10"/>
          <div class="h-24 text-gray-600 text-center">
            <p class="text-primary text-sm">@{orga.name}</p>
            <p class="text-sm p-2">{orga.description}</p>
          </div>
          <div
                  class="w-full text-white text-center hover:bg-primary uppercase p-2
            bg-secondary font-bold">
            View Details
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="aside">
    <div class="overflow-x-scroll p-8 text-right">
      <div class="text-gray-400 uppercase font-bold pt-4 py-2">
        sort by country
      </div>
      {#each countries as country}
        <div class="text-gray-700 hover:bg-gray-300 ">{country.name}</div>
      {/each}

      <div class="text-gray-400 uppercase font-bold pt-4 py-2">
        sort by city
      </div>
      {#each cities as city}
        <div class="text-gray-700 hover:bg-gray-300">{city.name}</div>
      {/each}

      <div class="text-gray-400 uppercase font-bold pt-4 py-2">
        sort by industry
      </div>
      {#each industries as industry}
        <div class="text-gray-700 hover:bg-gray-300">{industry.name}</div>
      {/each}
    </div>

  </div>
</section>
