<script>
  import OmoHero from "./../2-molecules/OmoHero";
  import OmoContributors from "./../2-molecules/OmoContributors";
  import OmoTechnologies from "./../2-molecules/OmoTechnologies";
  import OmoBanner from "./../2-molecules/OmoBanner";
  import OmoSteps from "./../2-molecules/OmoSteps";
  import OmoRoadmap from "./../2-molecules/OmoRoadmap";
  import OmoSubscribe from "./../2-molecules/OmoSubscribe";
  import OmoSquares from "./../2-molecules/OmoSquares";

  const vision = {
    title: "one dream shared",
    subline:
      "is one quantum leap more powerful than a 1000 obstacles and roadblocks ahead",
    image: "/images/thought-catalog-23KdVfc395A-unsplash.jpg"
  };
  const mission = {
    uptitle: "our dream is to",
    title: "grow your passions week by week",
    subline:
      "experience the growth of playful and joyful passion when opensourcing your dreams to the crowd",
    text:
      "publicly challenge your dreams to turn your small seeds of inspiration into large trees of fruitful abundance. Intrinsicly, Omos begin to share your dreams and commit their time to co-create with you the social-, technological-, organizational- and financial opensource systems, tools and protocols to transform the shared dreams into empowering and joyful passions."
  };
  const steps = {
    data: {
      steps: [
        {
          image: "/images/ideas.svg",
          title: "1. CHALLENGE YOUR DREAMS",
          description:
            "Increase the velocity of collaborative innovation by open sourcing your dreams and visions through our omo design thinking process "
        },
        {
          image: "/images/app.svg",
          title: "2. PLAY WITH YOUR ASSUMPTIONS",
          description:
            "Omo's co-create and iterate ideas and interactive prototypes to evaluate your assumptions as early as possible in a matter of days and weeks."
        },
        {
          image: "/images/happy.svg",
          title: "3. CROWDFUND YOUR GOALS",
          description:
            "Once evaluated successfully traction picks up magically and embraces the work of your co-creators with crowdfunded early adopter benefits and privileges."
        }
      ]
    }
  };
  const process = {
    uptitle: "Our 5 step evolution circle",
    title: "a lifelong journey towards abundance",
    subline:
      "enjoy and build your dreams with us on top of circles the most important and innovative human-centered universal basic income currency of our time"
  };

  const quote = {
    text:
      "OMO EARTHS crowdsourcing and crowdfunding tools are build on top of the CIRCLES universal basic income currency protocol. Circles introduces a radical new breed of money and a value based on human centered trust, with the mission to empower sustainable human innovation growth for a greater common good"
  };

  const documentation = {
    uptitle: "OUR HANDBOOK",
    title: "How to play with omo code blocks",
    subline:
      "WIP: A quick introduction of our core tech concepts and how you can interact with it (EARLY ALPHA) "
  };

  const roadmap = {
    uptitle: "Our roadmap",
    title: "One quantum leap dream at a time",
    subline:
      "our roadmap is fluid and an ever evolving set of technological-, social- and economic- tools, we ideate, iterate and implement over time"
  };
  const contributors = {
    uptitle: "omo co-creators",
    title: "contributing tools to the commons",
    subline:
      "Omo co-creators love to empower other dreamers, makers, developers and entrepreneuers, by playing with and adapting opensource, decentralized and modern technologies for a greater common good"
  };
  const square1 = {
    title: "1. Plant 10 Seeds",
    text:
      "inspire 10 dream patrons, who commit every week min 1 hour to your dream",
    illustration: "/illustrations/plant_the_seed.svg"
  };
  const square2 = {
    title: "2. Gather 50+ Votes",
    text: "to dance and filter out the most promising idea which you will test",
    illustration: "/illustrations/gather_the _votes.svg"
  };
  const square3 = {
    title: "3. Test 100+ Makers",
    text: "to evaluate your prototype by crowdfunding 5.000+ Circles (~5k€)",
    illustration: "/illustrations/evaluate.svg"
  };
  const square4 = {
    title: "4. Inspire 500+ Omos",
    text:
      "to pre-order your future services and products for 50.000+ Circles (~50k €)",
    illustration: "/illustrations/inspire.svg"
  };
  const square5 = {
    title: "5. Trust 1000+ investors",
    text:
      "who guarantee you an exchange rate of 1 Circle = 0,50 € (up to 500.000€)",
    illustration: "/illustrations/trust.svg"
  };
  const square6 = {
    title: "REPEAT THE CIRCLE",
    text:
      "inspire 10 dream patrons, who commit every week min 1 hour to your dream",
    illustration: "/illustrations/plant_the_seed.svg"
  };
</script>

<div class="overflow-hidden overflow-y-auto">
  <OmoBanner quant={vision} />
  <div class="p-8 sm:p-12 md:p-16 lg:p-32">
    <OmoHero quant={mission} />

    <OmoSteps quant={steps} />
  </div>
  <div
    class="p-8 sm:p-12 md:p-16 lg:p-32 text-2xl text-white bg-orange-400
    text-center w-full"
    style="font-family: 'Montserrat', sans-serif !important;">
    {quote.text}
  </div>
  <div class="p-8 sm:p-12 md:p-16 lg:p-32">

    <OmoHero quant={process} />

    <OmoSquares quant={square1} />
    <OmoSquares quant={square2} />
    <OmoSquares quant={square3} />
    <OmoSquares quant={square4} />
    <OmoSquares quant={square5} />
    <OmoSquares quant={square6} />

    <div class="pt-12">
      <OmoHero quant={contributors} />
      <OmoContributors />
    </div>

    <div class="py-24">

      <div class="py-6">
        <OmoHero quant={documentation} />

        <OmoTechnologies />

        <p class="text-gray-900 mb-6">
          Omo's technological foundation is an
          <span class="underline font-bold">
            offline first, decentralized and user owned
          </span>
          encrypted by default dream-designer, app-builder, private datastore
          and personal currency based on the
          <a href="https://joincircles.net" class="text-green-500 font-bold">
            Circles-UBI protocol,
          </a>
          <a href="https://ipfs.io/" class="text-green-500 font-bold">
            IPFS Filesystem
          </a>
          and
          <a href="https://textile.io/" class="text-green-500 font-bold">
            Textile Threads DB
          </a>
          with an typesave ORM-Layer based on
          <a href="https://graphql.org/" class="text-green-500 font-bold">
            GraphQL
          </a>
          with default realtime updates via subscriptions, including some
          reactive UI/UX sugar-syntax with
          <a href="https://svelte.dev/" class="text-green-500 font-bold">
            Svelte
          </a>
          and
          <a href="https://tailwindcss.com/" class="text-green-500 font-bold">
            Tailwind
          </a>
        </p>

        <!-- <p>
          To get started, just select the editor on the bottom menu to start
          adding and deleting database entries which will update the
          relationships between the objects. Every change will change directly
          and in realtime the textile threads DB offline first in your local
          store. (Currently not working, being re-factored)
        </p> -->
        <br />
        <div class="pt-12">
          <b class="text-blue-900 text-xl text-bold uppercase">
            Install and play with the code yourself
          </b>
          <br />
          Note that you will need to have
          <a href="https://nodejs.org" class="text-green-500 font-bold">
            Node.js
          </a>
          and npm installed.
          <br />
          <!-- <span class="underscore py-1">
            Download, install and
            <b>run</b>
          </span>
          the textile threads DB deamon
          <a href="go-threads" class="py-1text-green-500 font-bold">
            https://github.com/textileio/go-threads
          </a> -->
          <div class="pt-2">Then download omo from github:</div>
          <div class="my-2 text-gray-600 italic">
            git clone https://github.com/omoearth/omo.git
          </div>

          <div class="my-2 text-gray-600 italic">cd omo</div>
          <div class="my-2 text-gray-600 italic">npm install</div>
          <div class="my-2 text-gray-600 italic">npm start</div>
          Navigate to
          <a href="http://localhost:5000">
            http://localhost:5000 to see your (d)app running locally. Edit files
            in `src`, save it, and reload the page to see your changes.
          </a>
        </div>
      </div>

    </div>
  </div>
</div>
