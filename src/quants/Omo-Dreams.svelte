<script>
  import OmoDream from "./Omo-Dream.svelte";
  export let db;
  export let dreams;
  if (!dreams) dreams = db.dreams;
</script>

<div class="flex justify-center my-20">
  <div class="w-5/6 xl:w-4/6">
    <img src="/images/divider-1.png" alt="divider" class="px-48 mt-8" />
    <h2
      class="text-center text-5xl text-ci mt-10 mb-6"
      style="font-family: 'Indie Flower'!important;">
      Unsere Träume
    </h2>
    <div class="text-2xl text-gray-600 text-center mb-16">
      <p style="font-family: 'Indie Flower'!important;">
        "nur wenn wir große Träume haben können wir ein bisschen was erreichen"
      </p>
    </div>
    <div class="flex content-start flex-wrap">
      {#each dreams as dream, i (dream.id)}
        <OmoDream {dream} {db} />
      {/each}
    </div>
  </div>
</div>

<!-- 
<div class="w-1/3 p-2">
    <div class="primary omo-border overflow-hidden omo-shadow">
      <img
        src={dream.image}
        class="primary h-64 w-full rounded-t-lg object-cover object-center"
        alt="image" />
      <div
        class="text-xl text-center p-4 text-gray-200 mb-2 bg-ci-2 flex
        flex-wrap justify-center content-center h-48">
        <p>"{dream.name}'s großer Lebenstraum ist {dream.dream}"</p>
      </div>
      <div class="px-6 pt-2">
        <p class="text-xs text-gray-500 mb-1 uppercase">
          Meine Leidenschaften
        </p>
        <span
          class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
          font-semibold text-gray-700 mr-2 mb-2">
          #{dream.freuden}
        </span>
        <span
          class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
          font-semibold text-gray-700 mr-2 mb-2">
          #freude 2
        </span>
        <span
          class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
          font-semibold text-gray-700 mr-2 mb-2">
          #freude 3
        </span>
        <span
          class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm
          font-semibold text-gray-700 mr-2 mb-2">
          #freude 4
        </span>
      </div>
      <div
        class="mt-4 w-full px-4 pt-1 pb-1 text-center hover:bg-orange-300
        hover:text-gray-800 bg-ci text-gray-100">
        <a href="#linktoblog " class="text-lg font-semibold">
          näher kennenlernen
        </a>
      </div>
    </div>
  </div>
-->
