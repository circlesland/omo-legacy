<script>
  import OmoHero from "./../2-molecules/OmoHero";
  import OmoContributors from "./../2-molecules/OmoContributors";
  import OmoPartners from "./../2-molecules/OmoPartners";

  const quant = {
    title: "transform your visions into (d)apps",
    subline:
      "imagine you could turn any idea with easy drag and drop lego-like building blocks, into modern opensource multiplatform and resilient serverless (d)apps",
    illustration: "/images/the_world_is_mine.svg"
  };
  const contributors = {
    title: "About OMO's",
    subline:
      "OMO contributors love to play with opensource, decentralized and modern web technologies"
  };
  const documentation = {
    title: "Getting Started",
    subline: "How to play with OMO.earth"
  };
</script>

<div class="overflow-hidden overflow-y-auto ">

  <OmoHero {quant} />

  <div class=" py-10">
    <p class="text-gray-900">
      OMO.earth is an
      <span class="underline font-bold">
        offline first, decentralized and serverless
      </span>
      encrypted by default database editor build on
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
  </div>
  <OmoPartners />
  <div class="py-6">
    <OmoHero quant={documentation} />
    <p>
      To get started, just select on the left side a schema and start adding and
      deleting database entries and update the relationships between the
      objects. Every change will update directly and in realtime the textile
      threads DB offline first in your local store.
    </p>
    <b>
      NOTE: For now you need a textile threads database deamon running locally,
      check out
      <a
        href="https://github.com/textileio/go-threads"
        class="text-green-500 font-bold">
        go-threads
      </a>
      for installing.
    </b>
    <br />
    <div class="pt-12">
      <b class="text-blue-900 text-xl text-bold uppercase">
        Install and play with the code yourself
      </b>
      <br />
      Note that you will need to have
      <a href="https://nodejs.org" class="text-green-500 font-bold">Node.js</a>
      and npm installed.
      <br />
      <span class="underscore py-1">Download, install and run</span>
      the textile threads DB deamon
      <a href="go-threads" class="py-1text-green-500 font-bold">
        https://github.com/textileio/go-threads
      </a>
      <div class="pt-2">Then download omo-quantum from github:</div>
      <div class="my-2 text-gray-600 italic">
        git clone https://github.com/omoearth/omo-quantum.git
      </div>

      <div class="my-2 text-gray-600 italic">cd omo-quantum</div>
      <div class="my-2 text-gray-600 italic">npm install</div>
      <div class="my-2 text-gray-600 italic">npm run start</div>
      Navigate to
      <a href="http://localhost:5000">
        http://localhost:5000 to see your (d)app running locally. Edit files in
        `src`, save it, and reload the page to see your changes.
      </a>
    </div>
  </div>

  <div class="pt-12">
    <OmoHero quant={contributors} />
    <OmoContributors />
  </div>
</div>
