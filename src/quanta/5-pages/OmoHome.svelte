<script>
  import OmoHero from "./../2-molecules/OmoHero";
  import OmoContributors from "./../2-molecules/OmoContributors";
  import OmoTechnologies from "./../2-molecules/OmoTechnologies";
  import OmoBanner from "./../2-molecules/OmoBanner";
  import OmoSteps from "./../2-molecules/OmoSteps";
  import OmoRoadmap from "./../2-molecules/OmoRoadmap";
  import OmoSubscribe from "./../2-molecules/OmoSubscribe";

  const vision = {
    uptitle: "OUR VISION",
    title: "fulfilling dreams",
    subline:
      "imagine any knowledge, all software, each hardware and every platform is opensource to be freely accessible to everyone",
    image: "https://source.unsplash.com/HOrhCnQsxnQ"
  };
  const mission = {
    uptitle: "our mission",
    title: "transform ideas into (d)apps",
    subline:
      "turn any idea with easy drag and drop lego-like building blocks into modern opensource multiplatform and resilient serverless (d)apps"
  };
  const steps = {
    data: {
      steps: [
        {
          image: "/images/ideas.svg",
          title: "Open Sharing",
          description:
            "Increase the velocity of collaborative innovation by adapting the successful concept of open source sharing to every industry"
        },
        {
          image: "/images/app.svg",
          title: "Platform-as-a-Service",
          description:
            "Recreate in a matter of days any modern platform like uber, airbnb, booking.com, netflix, udemy, linkedin, takeaway, codeacademy etc"
        },
        {
          image: "/images/happy.svg",
          title: "0% Provision forever",
          description:
            "Gone are the times of 30% here and 15% there for just making an introduction. We will never take a percentage of your profit!"
        }
      ]
    }
  };
  const features = {
    uptitle: "Our features",
    title: "Simple fullstack framework",
    subline: "we combine the latest technologies of modern web development"
  };
  const documentation = {
    uptitle: "How to play with omo",
    title: "Getting Started",
    subline: "A quick introduction of our concepts and how you can contribute"
  };
  const roadmap = {
    uptitle: "Our roadmap",
    title: "One quantum leap at a time",
    subline:
      "our roadmap is fluid and an ever evolving set of features and functionalities that we implement over time"
  };
  const contributors = {
    uptitle: "about us",
    title: "Contributing to the commons",
    subline:
      "OMO contributors love to enable developers and makers to play with opensource, decentralized and modern web technologies"
  };
</script>

<div class="overflow-hidden overflow-y-auto">
  <OmoBanner quant={vision} />
  <div class="p-8 sm:p-12 md:p-16 lg:p-32">
    <OmoHero quant={mission} />

    <OmoSteps quant={steps} />

    <div class="py-24">
      <OmoHero quant={features} />

      <p class="text-gray-900 mb-6">
        OMO.earth will be an
        <span class="underline font-bold">
          offline first, decentralized and serverless
        </span>
        encrypted by default database, schema editor and app-designer build on
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
          store.
        </p>
        <b class="text-lg text-red-400">
          NOTE: For now you need a textile threads database deamon running
          locally (until we implemented the textile.js adapter) check out
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

      <div class="py-8">
        <OmoHero quant={roadmap} />
        <div class="m-auto text-center">
          for more details see our
          <a
            class="text-green-500 font-bold"
            href="https://github.com/omoearth/omo-quantum/milestones?direction=asc&sort=title&state=open">
            Github Milestones
          </a>
          or if you have feature requests and bug reports let us know on:
          <a
            class="text-green-500 font-bold"
            href="https://github.com/omoearth/omo-quantum/issues">
            Github Issues
          </a>
        </div>
      </div>

     <!-- <OmoRoadmap /> -->

      <!-- <div class="pt-12">
        <OmoHero quant={contributors} />
        <OmoContributors />
      </div> -->

    </div>
  </div>
</div>
