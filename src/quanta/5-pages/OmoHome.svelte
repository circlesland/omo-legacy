<script>
  import OmoHero from "./../2-molecules/OmoHero";
  import OmoContributors from "./../2-molecules/OmoContributors";
  import OmoTechnologies from "./../2-molecules/OmoTechnologies";
  import OmoBanner from "./../2-molecules/OmoBanner";
  import OmoSteps from "./../2-molecules/OmoSteps";
  import OmoRoadmap from "./../2-molecules/OmoRoadmap";
  import OmoSubscribe from "./../2-molecules/OmoSubscribe";

  const vision = {
    uptitle: "OUR DREAM",
    title: "is your dream",
    subline:
      "imagine any knowledge, all software, each hardware and every platform is opensource and at your service to empower you implementing your dreams",
    image: "/images/thought-catalog-23KdVfc395A-unsplash.jpg"
  };
  const mission = {
    uptitle: "our mission",
    title: "grow your passion",
    subline:
      "we invest time, resources and money to grow with you together your little seeds of inspiration, into large beautiful trees of fruitful and joyful abundance.",
    text:
      "We believe in the power of vision and dreams and have experienced the wonderful and great things passion can enable and build when being shared and pursued collaboratively. Our dream is to inspire and empower you, by developing the social-, technological-, organizational- and economical systems, tools and protocols of tomorrow."
  };
  const steps = {
    data: {
      steps: [
        {
          image: "/images/ideas.svg",
          title: "Vision Maker Process",
          description:
            "Increase the velocity of collaborative innovation by adapting the successful concept of open sourcing your life goals with the omo sapiens life design thinking process"
        },
        {
          image: "/images/app.svg",
          title: "Dreams-as-a-Service",
          description:
            "Recreate and integrate in a matter of days or weeks any modern services you need for your dreams, like uber, airbnb, booking.com, netflix, udemy, linkedin, takeaway, etc"
        },
        {
          image: "/images/happy.svg",
          title: "0% Provision forever",
          description:
            "Gone are the times of 25%+ provision for just connecting resources. We never take a percentage of your passion, you only share if we are able to create true value for you"
        }
      ]
    }
  };
  const features = {
    uptitle: "Our tools",
    title: "Simple fullstack framework",
    subline:
      "we combine the latest technologies, currencies and economic models to grow today the sustainable tomorrow"
  };
  // const why = {
  //   uptitle: "Our tech stack",
  //   title: "Simple fullstack framework",
  //   subline: "we combine the latest technologies of modern web development"
  // };
  const documentation = {
    uptitle: "How to play with omo",
    title: "WIP: Documentation",
    subline:
      "A quick introduction of our core tech concepts and how you can interact with it (early alpha)"
  };
  const roadmap = {
    uptitle: "Our roadmap",
    title: "One quantum leap at a time",
    subline:
      "our roadmap is fluid and an ever evolving set of technological-, social- and economic- tools, we ideate, iterate and implement over time"
  };
  const contributors = {
    uptitle: "about omo dreamers",
    title: "Contributing to the commons",
    subline:
      "OMO contributors love to empower dreamers, entrepreneurs, makers and developers to play with opensource, decentralized and modern technologies and currencies"
  };
</script>

<div class="overflow-hidden overflow-y-auto">
  <OmoBanner quant={vision} />
  <div class="p-8 sm:p-12 md:p-16 lg:p-32">
    <OmoHero quant={mission} />

    <!-- <OmoHero quant={why} /> -->

    <OmoSteps quant={steps} />
    <div class="py-8">
      <OmoHero quant={roadmap} />
      <div class="m-auto text-center">
        for more details see our
        <a
          class="text-green-500 font-bold"
          href="https://github.com/omoearth/omo-quantum/milestones?direction=asc&sort=title&state=open">
          Github Milestones (currently outdated, will be updated soon),
        </a>
        or if you have feature requests and bug reports let us know on:
        <a
          class="text-green-500 font-bold"
          href="https://github.com/omoearth/omo-quantum/issues">
          Github Issues
        </a>
      </div>
    </div>
    <OmoRoadmap />

    <div class="pt-12">
      <OmoHero quant={contributors} />
      <OmoContributors />
    </div>

    <div class="py-24">
      <OmoHero quant={features} />

      <p class="text-gray-900 mb-6">
        OMO.earth is an
        <span class="underline font-bold">
          offline first, decentralized and user owned
        </span>
        encrypted by default dream-designer, app-builder, private database and
        personal currency based on
        <a href="https://joincircles.net" class="text-green-500 font-bold">
          circles universal basic income
        </a>
        and
        <a href="https://ipfs.io/" class="text-green-500 font-bold">ipfs</a>
        and
        <a href="https://textile.io/" class="text-green-500 font-bold">
          textile threads
        </a>
        with an typesave ORM-Layer based on
        <a href="https://graphql.org/" class="text-green-500 font-bold">
          graphql
        </a>
        with default realtime updates via subscriptions, including some reactive
        UI/UX sugar-syntax with
        <a href="https://svelte.dev/" class="text-green-500 font-bold">
          svelte
        </a>
        and
        <a href="https://tailwindcss.com/" class="text-green-500 font-bold">
          tailwind.css
        </a>
      </p>

      <OmoTechnologies />

      <div class="py-6">
        <OmoHero quant={documentation} />
        <p>
          To get started, just select the editor on the bottom menu to start
          adding and deleting database entries which will update the
          relationships between the objects. Every change will change directly
          and in realtime the textile threads DB offline first in your local
          store. (Currently not working, being re-factored)
        </p>
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
          <span class="underscore py-1">
            Download, install and
            <b>run</b>
          </span>
          the textile threads DB deamon
          <a href="go-threads" class="py-1text-green-500 font-bold">
            https://github.com/textileio/go-threads
          </a>
          <div class="pt-2">Then download omo-quantum from github:</div>
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
