<script>
  export let quant = {
    data: {
      steps: [
        {
          version: "v0.1.0 alpha",
          date: "2020 JAN",
          title: "PROTOTYPE: Store web-components on IPFS",
          description: "",
          done: true
        },
        {
          version: "v0.2.0 alpha",
          date: "2020 FEB",
          title: "PROTOTYPE: Svelte Mini-Platform",
          description: "",
          done: true
        },
        {
          version: "v0.3.0 alpha",
          date: "2020 MAR",
          title: "PROTOTYPE: CRUD on textileio threads",
          description: "",
          done: true
        },
        {
          version: "v0.4.0 alpha",
          date: "2020 MAI",
          title: "PROTOTYPE: GraphQL Editor",
          description:
            "Basic CODA like Schema- and Data-Editor with Graphql subscriptions on-top of textileio threads",
          done: true
        },
        {
          version: "v0.5.0 alpha",
          date: "2020 JULI",
          title: "LAUNCH: First dream profiles",
          description:
            "We make interviews with you about your greatest dreams in life and build websites, apps and tools with you to grow your passion",
          done: false
        },
        {
          version: "v0.6.0 alpha",
          date: "2020 AUG",
          title: "PROTOTYPE: Crowdsourcing Dreams",
          description:
            "Omo.earth is build on top of the Circles universal basic income currency protocol, which enables us to crowdsource your dreams",
          done: false
        },
        {
          version: "v0.7.0 alpha",
          date: "2020 SEP",
          title: "IMPLEMENT: Integrate UBI-Blockchain",
          description:
            "Integrate and switch to the real Circles-UBI Blockchain Token on xDAI",
          done: false
        },
        {
          version: "v0.8.0 alpha",
          date: "2020 OKT",
          title: "POC: Quanta-Code Editor",
          description:
            "Create, edit and compile quanta as web-components with a SVELTE REPL like editor to ipfs and the textile threads DB",
          done: false
        },
        {
          version: "v0.9.0 alpha",
          date: "2020 NOV",
          title: "POC: Basic UI-Designer",
          description:
            "Simple Designer-Editor to create different views, with the help of a basic design system based on svelte components, inspired by 'styled system' and the tailwind syntax",
          done: false
        },
        {
          version: "v1.0.0 private beta",
          date: "2020 DEZ",
          title: "TEST: Test run beta funding",
          description: "",
          done: false
        },
        {
          version: "v1.1.0 public",
          date: "2021 JAN",
          title: "LAUNCH: The first dream crowdfunds",
          description:
            "which will be runnning completely on top of the circles-ubi protocol",
          done: false
        }
      ]
    }
  };
</script>

<div class="relative w-1/2 m-auto">
  <ul class="list-none m-0 p-0">
    {#each quant.data.steps as step, i}
      <li class="mb-2">
        <div class="flex items-center mb-1">
          {#if step.done}
            <div class="rounded-full h-12 w-12 bg-green-400" />
          {/if}
          {#if !step.done}
            <div class="rounded-full h-12 w-12 bg-gray-500" />
          {/if}
          <div class="flex-1">
            {#if step.done}
              <span
                class="text-gray-500 ml-4 text-xl"
                style="font-family: 'Montserrat', sans-serif !important;">
                {step.title}
              </span>
            {/if}
            {#if !step.done}
              <span
                class="text-blue-800 ml-4 text-xl"
                style="font-family: 'Montserrat', sans-serif !important;">
                {step.title}
              </span>
            {/if}
          </div>
        </div>
        <div class="ml-16 font-bold italic">{step.version} - {step.date}</div>
        <div class="ml-16">{step.description}</div>
      </li>
    {/each}
  </ul>
</div>
