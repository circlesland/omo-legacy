<script>
  export let quant = {
    data: {
      steps: [
        {
          version: "v0.1.0 alpha",
          date: "2020 JAN",
          title: "POC: Store web-components on IPFS",
          description: "",
          done: true
        },
        {
          version: "v0.2.0 alpha",
          date: "2020 FEB",
          title: "POC: Svelte Mini-Platform",
          description: "",
          done: true
        },
        {
          version: "v0.3.0 alpha",
          date: "2020 MAR",
          title: "POC: CRUD on textilo threads",
          description: "",
          done: true
        },
        {
          version: "v0.4.0 alpha",
          date: "2020 MAI",
          title: "POC: GraphQL Editor",
          description:
            "Basic CODA like Schema- and Data-Editor with Graphql subscriptions deployed via textile.io buckets",
          done: false
        },
        {
          version: "v0.5.0 alpha",
          date: "2020 JUNE",
          title: "POC: Todo- and Milestone Mini-App",
          description:
            "Create a basic TodoApp with tasks, users and milestones on a kanban board (based on dynamic js threads)",
          done: false
        },
        {
          version: "v0.6.0 alpha",
          date: "2020 JULI",
          title: "POC: Create a basic design system",
          description:
            "Create a basic design system based on omo quanta (svelte components), inspired by 'styled system' and the tailwind syntax.",
          done: false
        },
        {
          version: "v0.7.0 alpha",
          date: "2020 AUG",
          title: "POC: Quanta-Code Editor",
          description:
            "Create, edit and compile quanta as web-components with a SVELTE REPL like editor to ipfs and textiel threats",
          done: false
        },
        {
          version: "v0.8.0 alpha",
          date: "2020 OKT",
          title: "POC: Basic UI-Desinger",
          description: "Simple Designer-Editor to create different views",
          done: false
        },
        {
          version: "v0.9.0 alpha",
          date: "2020 DEZ",
          title: "POC: Flow-Programming Editor",
          description: "",
          done: false
        },
        {
          version: "v1.0.0 beta",
          date: "2021+",
          title: "Launch Beta Platform",
          description:
            "Organise global hackathons to re-create open source clones of airbnb, booking, uber, lyft, netflix, disney, takeaway etc",
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
