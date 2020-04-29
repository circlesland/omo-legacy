<script>
  import OmoHero from "./../2-molecules/OmoHero";
  import OmoContributors from "./../2-molecules/OmoContributors";

  const quant = {
    title: "transforming visions into (d)apps",
    subline:
      "Imagine you could turn any idea with easy drag and drop lego-like building blocks, into modern opensource multiplatform resilient (d)apps",
    illustration: "/images/the_world_is_mine.svg"
  };
  const quant2 = {
    title: "About OMO's",
    subline:
      "OMO contributors love to play with opensource, decentralized and modern web technologies"
  };
</script>

<div class="overflow-hidden overflow-y-auto ">

  <OmoHero {quant} />

  <div class="text-center">
    <p class="text-gray-900">
      OMO.alpha is an
      <span class="underline font-bold">offline first</span>
      ,
      <span class="underline font-bold">decentralized</span>
      ,
      <span class="underline font-bold">privacy preserving</span>
      encrypted database editor build on
      <a href="https://ipfs.io/" class="text-green-500 font-bold">ipfs</a>
      and
      <a href="https://textile.io/" class="text-green-500 font-bold">
        textile threads
      </a>
      with an typesave ORM-Layer based on
      <a href="https://graphql.org/" class="text-green-500 font-bold">
        graphql
      </a>
      and default realtime updates via subscriptions including some reactive
      UI/UX sugar-syntax with
      <a href="https://svelte.dev/" class="text-green-500 font-bold">svelte</a>
      and
      <a href="https://tailwindcss.com/" class="text-green-500 font-bold">
        tailwind.css
      </a>
    </p>

    <div class="pt-10">
      To get started, just select on the left side a schema and start adding and
      deleting database entries and update the relationships between the
      objects.
    </div>
  </div>

  <div class="pt-12">
    <OmoHero quant={quant2} />
    <OmoContributors />
  </div>
</div>
