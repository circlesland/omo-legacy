<script>
  import OmoWishes from "../../../quants/Omo-Wishes.svelte";
  import OmoCity from "../../../quants/Omo-City.svelte";
  import OmoLeidenschaften from "../../../quants/OmoLeidenschaften.svelte";
  export let db;
  export let dream;
  export let currentId;
  if (!dream) dream = db.dreams.find(x => x.id == currentId);
  let wishes = db.wishes.filter(w => dream.wishes.some(dw => w.id));
  let leidenschaften = db.leidenschaften.filter(ls =>
    dream.leidenschaften.some(x => x == ls.id)
  );
  let schwierigkeiten = db.schwierigkeiten.filter(ls =>
    dream.schwierigkeiten.some(x => x == ls.id)
  );
  let city = db.cities.find(x => x.id == dream.city);
</script>

<div
  class="py-64 text-4xl text-gray-700 w-full flex content-center flex-wrap
  bg-cover bg-center justify-center overflow-hidden"
  style="background-image: url('{dream.image}')"
  title="dream" />
<div
  class="text-4xl text-center px-4 py-16 text-gray-200 bg-ci-2 flex flex-wrap
  justify-center content-center">
  <p style="font-family: 'Indie Flower'!important;">
    "{dream.name}'s großer Lebenstraum ist es {dream.dream}"
  </p>
</div>
<div class="flex justify-center my-10">
  <div class="w-5/6 xl:w-4/6">
    <img src="/images/divider-1.png" alt="divider" class="px-48 mt-8" />
    <h2
      class="text-center text-5xl text-ci mt-10 mb-6"
      style="font-family: 'Indie Flower'!important;">
      Meine schöne Heimatstadt
    </h2>
    <div class="flex justify-center">
      <OmoCity {city} {db} />
    </div>
  </div>
</div>
<div class="flex justify-center my-10">
  <div class="w-5/6 xl:w-4/6">
    <OmoWishes {wishes} />

    <div class="flex content-start flex-wrap">
      <OmoLeidenschaften {leidenschaften} />
      <div class="w-1/2 p-2">
        <div class="flex flex-col bg-white px-8 py-6 rounded-lg shadow-lg">
          <div class="flex justify-center items-center">
            <a
              class="p-3 py-1 bg-gray-600 text-sm text-green-100 rounded-full"
              href="#">
              Womit ich mir schwer tue
            </a>
          </div>
          <div class="mt-4 text-center">
            <div class="px-6 pt-2 pb-2">
              {#each schwierigkeiten as schwierigkeit}
                <span
                  class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
                  font-semibold text-gray-700 mr-2 mb-2">
                  #{schwierigkeit.tag}
                </span>
              {/each}
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</div>

<div class="flex justify-center my-20">
  <div class="w-5/6">
    <div class="flex justify-center">
      <a
        href="chat"
        class="hover:bg-orange-300 hover:text-gray-800 bg-ci text-gray-100
        font-semibold rounded-full px-6 py-3 text-3xl"
        style="font-family: 'Indie Flower'!important;">
        Jetzt die Lebensträume von {dream.name} erfüllen
      </a>
    </div>
    <!-- <div
      class="p-4 text-2xl rounded-lg hover:bg-orange-300 hover:text-gray-800
      bg-ci text-gray-100">
      <a
        href="#linktoitem"
        class="flex justify-center text-center text-bolt uppercase">
        Jetzt Lebensträume erfüllen
      </a>
    </div> -->
  </div>
</div>
